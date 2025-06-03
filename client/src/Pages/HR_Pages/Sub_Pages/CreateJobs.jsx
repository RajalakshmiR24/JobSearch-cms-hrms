import React, { useState } from "react";
import axios from "axios";

const CreateJobs = () => {
  const [formData, setFormData] = useState({
    postingTitle: "",
    title: "",
    departmentName: "",
    hiringManager: {
      hr_id: "",
      name: "",
    },
    numOfPositions: "",
    address: {
      city: "",
      state: "",
      country: "",
      pin: "",
    },
    dateOpened: "",
    targetDate: "",
    industry: "",
    isPhoneNumberVisible: false,
    jobOpeningStatus: "Open",
    jobType: "Full-time",
    minSalary: {
      lakh: "",
      thousand: "",
    },
    maxSalary: {
      lakh: "",
      thousand: "",
    },
    notes: {
      jobDescription: "",
      requirements: "",
      benefits: "",
    },
    other_job_title: "",
    requiredSkills: [],
    workExp: {
      workExpInYear: "",
      workExpInMonth: "",
    },
  });

  const [skillInput, setSkillInput] = useState("");
  const [createdMessage, setCreatedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData((prev) => {
        const updated = { ...prev };
        let current = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = type === "checkbox" ? checked : value;
        return { ...updated };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (index) => {
    setFormData((prev) => {
      const updatedSkills = [...prev.requiredSkills];
      updatedSkills.splice(index, 1);
      return { ...prev, requiredSkills: updatedSkills };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.postingTitle || !formData.title || !formData.numOfPositions) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/jobs", formData);
      setCreatedMessage("Job created successfully!");
      setFormData({
        postingTitle: "",
        title: "",
        departmentName: "",
        hiringManager: {
          hr_id: "",
          name: "",
        },
        numOfPositions: "",
        address: {
          city: "",
          state: "",
          country: "",
          pin: "",
        },
        dateOpened: "",
        targetDate: "",
        industry: "",
        isPhoneNumberVisible: false,
        jobOpeningStatus: "Open",
        jobType: "Full-time",
        minSalary: {
          lakh: "",
          thousand: "",
        },
        maxSalary: {
          lakh: "",
          thousand: "",
        },
        notes: {
          jobDescription: "",
          requirements: "",
          benefits: "",
        },
        other_job_title: "",
        requiredSkills: [],
        workExp: {
          workExpInYear: "",
          workExpInMonth: "",
        },
      });
    } catch (err) {
      setError("Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-8">
      <h2 className="text-2xl font-semibold mb-6">Create Job Role</h2>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin border-t-4 border-blue-500 w-8 h-8 border-solid rounded-full"></div>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      {createdMessage && <p className="text-green-500">{createdMessage}</p>}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        {[["postingTitle", "Posting Title"], ["title", "Job Title"], ["departmentName", "Department Name"], ["hiringManager.hr_id", "Hiring Manager ID"], ["hiringManager.name", "Hiring Manager Name"], ["numOfPositions", "Number of Positions"]].map(([name, label]) => (
          <div className="mb-4" key={name}>
            <label className="block mb-1 font-medium">{label}</label>
            <input
              type="text"
              name={name}
              value={name.split('.').reduce((acc, part) => acc[part], formData)}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>
        ))}

        {/* Address */}
        {[["address.city", "City"], ["address.state", "State"], ["address.country", "Country"], ["address.pin", "PIN Code"]].map(([name, label]) => (
          <div className="mb-4" key={name}>
            <label className="block mb-1 font-medium">{label}</label>
            <input
              type="text"
              name={name}
              value={name.split('.').reduce((acc, part) => acc[part], formData)}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>
        ))}

        {/* Dates */}
        {[["dateOpened", "Date Opened"], ["targetDate", "Target Date"]].map(([name, label]) => (
          <div className="mb-4" key={name}>
            <label className="block mb-1 font-medium">{label}</label>
            <input
              type="date"
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>
        ))}

        {/* Industry & Status */}
        {[["industry", "Industry"], ["jobOpeningStatus", "Job Status"], ["jobType", "Job Type"], ["other_job_title", "Other Job Title"]].map(([name, label]) => (
          <div className="mb-4" key={name}>
            <label className="block mb-1 font-medium">{label}</label>
            <input
              type="text"
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>
        ))}

        {/* Salary */}
        <div className="text-xl mt-6 mb-2 font-semibold">Salary Range</div>
        {["minSalary", "maxSalary"].map((type) => (
          <div className="grid grid-cols-2 gap-4 mb-4" key={type}>
            <div>
              <label className="block mb-1 font-medium">{`${type} (Lakh)`}</label>
              <input
                type="number"
                name={`${type}.lakh`}
                value={formData[type].lakh}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">{`${type} (Thousand)`}</label>
              <input
                type="number"
                name={`${type}.thousand`}
                value={formData[type].thousand}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 rounded"
              />
            </div>
          </div>
        ))}

        {/* Experience */}
        <div className="text-xl mt-6 mb-2 font-semibold">Work Experience</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            name="workExp.workExpInYear"
            value={formData.workExp.workExpInYear}
            onChange={handleChange}
            placeholder="Years"
            className="p-2 bg-gray-700 rounded"
          />
          <input
            type="number"
            name="workExp.workExpInMonth"
            value={formData.workExp.workExpInMonth}
            onChange={handleChange}
            placeholder="Months"
            className="p-2 bg-gray-700 rounded"
          />
        </div>

        {/* Notes */}
        <div className="text-xl mt-6 mb-2 font-semibold">Job Notes</div>
        {["jobDescription", "requirements", "benefits"].map((field) => (
          <div className="mb-4" key={field}>
            <label className="block mb-1 font-medium">{field}</label>
            <textarea
              name={`notes.${field}`}
              value={formData.notes[field]}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>
        ))}

        {/* Phone Visibility */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="isPhoneNumberVisible"
              checked={formData.isPhoneNumberVisible}
              onChange={handleChange}
              className="mr-2"
            />
            Display Phone Number to Candidates
          </label>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Required Skills</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="flex-1 p-2 bg-gray-700 rounded"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-green-600 px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.requiredSkills.map((skill, index) => (
              <span key={index} className="bg-blue-600 px-2 py-1 rounded">
                {skill}{" "}
                <button type="button" onClick={() => handleRemoveSkill(index)}>
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobs;
