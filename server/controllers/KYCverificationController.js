
const axios = require('axios');
const KYC = require('../models/KYC');
const Candidate = require('../models/Candidate');

exports.uploadKYC = async (req, res) => {
    try {
        const hash = req.hash;
        const candidate_id = req.candidate_id;

        const existingApprovedKYC = await KYC.findOne({ candidate_hash: hash, kycStatus: 'approved' });
        if (existingApprovedKYC) {
            return res.status(200).json({
                code: 400,
                success: false,
                message: 'KYC already approved for this candidate. Cannot create a new KYC URL.',
            });
        }


        const existingPendingKYC = await KYC.findOne({ candidate_hash: hash, kycStatus: 'pending' });
        if (existingPendingKYC) {
            const response = await axios.get(`${process.env.KYC_API_URL}/api/kyc/pkce`);


            if (response.status === 200 && response.data && response.data.value) {
                const { url, state, codeChallenge, verifier } = response.data.value;


                existingPendingKYC.state = state;
                existingPendingKYC.codeChallenge = codeChallenge;
                existingPendingKYC.verifier = verifier;
                existingPendingKYC.kycStatus = 'pending';
                existingPendingKYC.candidate_id = candidate_id;

                await existingPendingKYC.save();

                return res.status(200).json({
                    success: true,
                    message: 'KYC URL updated for the candidate with pending status.',
                    kycUrl: url,
                    state,
                    codeChallenge,
                    verifier,
                });
            } else {

                return res.status(200).json({
                    success: false,
                    message: 'Failed to fetch KYC URL from PKCE generator.',
                });
            }
        }


        const response = await axios.get(`${process.env.KYC_API_URL}/api/kyc/pkce`);


        if (response.status === 200 && response.data && response.data.value) {
            const { url, state, codeChallenge, verifier } = response.data.value;

            const kycData = new KYC({
                state,
                codeChallenge,
                verifier,
                kycStatus: 'pending',
                candidate_hash: hash,
                candidate_id: candidate_id,
            });

            await kycData.save();

            return res.status(200).json({
                success: true,
                message: 'KYC URL generated and saved successfully',
                kycUrl: url,
                state,
                codeChallenge,
                verifier,
            });
        } else {

            return res.status(200).json({
                success: false,
                message: 'Failed to fetch KYC URL from PKCE generator.',
            });
        }
    } catch (error) {
        console.error('Error in uploadKYC:', error);


        return res.status(200).json({
            success: false,
            message: 'An unexpected error occurred while processing KYC.',
            error: error.message,
        });
    }
};


exports.redirectKYC = async (req, res) => {
    const { code, state } = req.body;
    try {
        const kycRecord = await KYC.findOne({ state: state });
        if (!kycRecord) {
            return res.status(200).json({
                code: 400,
                message: 'State mismatch or invalid state.',
            });
        }

        const { verifier } = kycRecord;
        const externalApiResponse = await axios.post(`${process.env.KYC_API_URL}/api/kyc/getToken`, {
            code: code,
            codeVerifier: verifier,
        });

        if (externalApiResponse.status === 200 && externalApiResponse.data && externalApiResponse.data.value) {
            const data = externalApiResponse.data.value;

            if (!data.scope) {
                return res.status(200).json({
                    code: 400,
                    message: 'Scope not found in the response data.',
                });
            }

            const panCredentialRegex = /in\.gov\.pan-(PANCR-[A-Z0-9]+)/;
            const drivingLicenseCredentialRegex = /in\.gov\.transport-DRVLC-([A-Z0-9]+)/;

            const panMatch = data.scope.match(panCredentialRegex);
            const drivingLicenseMatch = data.scope.match(drivingLicenseCredentialRegex);

            if (!panMatch && !drivingLicenseMatch) {
                return res.status(200).json({
                    code: 400,
                    message: 'Either PAN or Driving License is required to proceed with the KYC process.',
                });
            }

            if (panMatch && panMatch[1]) {
                const panWithoutPrefix = panMatch[1].replace('PANCR-', '');
                const existingRecord = await KYC.findOne({ pan: panWithoutPrefix, kycStatus: 'approved' });
                if (existingRecord) {
                    return res.status(200).json({
                        code: 400,
                        message: 'PAN is already associated with an approved KYC record.',
                    });
                }
                kycRecord.pan = panWithoutPrefix;
                kycRecord.panCredential = `in.gov.pan-${panMatch[1]}`;
            }

            if (drivingLicenseMatch && drivingLicenseMatch[1]) {
                const drivingLicenseWithoutPrefix = drivingLicenseMatch[1];
                const existingRecord = await KYC.findOne({ drivingLicense: drivingLicenseWithoutPrefix, kycStatus: 'approved' });
                if (existingRecord) {
                    return res.status(200).json({
                        code: 400,
                        message: 'Driving License is already associated with an approved KYC record.',
                    });
                }
                kycRecord.drivingLicense = drivingLicenseWithoutPrefix;
                kycRecord.drivingLicenseCredential = `in.gov.transport-DRVLC-${drivingLicenseMatch[1]}`;
            }

            kycRecord.access_token = data.access_token;
            kycRecord.scope = data.scope;

            await kycRecord.save();

            const eaadharResponse = await axios.post(`${process.env.KYC_API_URL}/api/kyc/eaadhar`, {
                token: kycRecord.access_token,
                pan: kycRecord.pan,
            });

            if (eaadharResponse.status === 200) {
                const eaadharData = eaadharResponse.data.value;

                if (!eaadharData.Poi) {
                    return res.status(200).json({
                        code: 400,
                        message: 'Failed to retrieve POI (Proof of Identity) data from e-Aadhar. Please check the provided details and try again.',
                    });
                }

                const poiData = Array.isArray(eaadharData.Poi) ? eaadharData.Poi.map(poi => ({
                    dob: poi['$'].dob,
                    gender: poi['$'].gender,
                    name: poi['$'].name,
                })) : [];

                if (poiData.length === 0) {
                    return res.status(200).json({
                        code: 400,
                        message: 'No valid POI (Proof of Identity) found in e-Aadhar data.',
                    });
                }

                const candidateId = kycRecord.candidate_id;
                const candidate = await Candidate.findOne({ candidate_id: candidateId });

                if (candidate) {
                    candidate.name = poiData[0].name;
                    await candidate.save();
                }

                const poaData = Array.isArray(eaadharData.Poa) ? eaadharData.Poa.map(poa => ({
                    co: poa['$'].co,
                    country: poa['$'].country,
                    dist: poa['$'].dist,
                    house: poa['$'].house,
                    lm: poa['$'].lm,
                    pc: poa['$'].pc,
                    po: poa['$'].po,
                    state: poa['$'].state,
                    street: poa['$'].street,
                    subdist: poa['$'].subdist,
                    vtc: poa['$'].vtc,
                })) : [];

                const phtData = Array.isArray(eaadharData.Pht) ? eaadharData.Pht.map(pht => ({
                    imageData: pht,
                })) : [];

                kycRecord.eaadhar_tkn = eaadharData['$'].tkn;
                kycRecord.eaadhar_uid = eaadharData['$'].uid;
                kycRecord.poi = poiData;
                kycRecord.poa = poaData;
                kycRecord.pht = phtData;

                await kycRecord.save();
                kycRecord.kycStatus = 'approved';
                await kycRecord.save();

                let fileRequestData = {
                    token: kycRecord.access_token,
                };

                
                if (kycRecord.panCredential) {
                    fileRequestData.name = 'PAN Verification Record';
                    fileRequestData.panCredential = kycRecord.panCredential;
                }

                
                if (kycRecord.drivingLicenseCredential) {
                    fileRequestData.name = 'Driving License';
                    fileRequestData.drivingLicenseCredential = kycRecord.drivingLicenseCredential;
                }

                try {
                    const fileResponse = await axios.post(`${process.env.KYC_API_URL}/api/kyc/getFile`, fileRequestData);

                    if (fileResponse.status === 200 && fileResponse.data) {
                        kycRecord.fileResponse = fileResponse.data.value;
                        await kycRecord.save();
                        return res.status(200).json({
                            code: 200,
                            success: true,
                            message: 'KYC verification successful and e-Aadhar information saved.',
                            status: 'approved',
                        });
                    } else {
                        return res.status(fileResponse.status).json({
                            code: fileResponse.status,
                            message: 'An error occurred while retrieving the PAN file.',
                        });
                    }
                } catch (fileError) {
                    return res.status(200).json({
                        code: 500,
                        message: 'An error occurred while fetching PAN file.',
                    });
                }

            } else {
                return res.status(eaadharResponse.status).json({
                    code: eaadharResponse.status,
                    message: 'Failed to retrieve e-Aadhar data. Please verify the token and try again.',
                });
            }

        } else {
            return res.status(externalApiResponse.status).json({
                code: externalApiResponse.status,
                message: externalApiResponse.error.message,
            });
        }

    } catch (error) {
        console.log(error.message);
        return res.status(200).json({
            code: 500,
            message: 'Failed to retrieve e-Aadhar data. Please try again.'
        });
    }
};
