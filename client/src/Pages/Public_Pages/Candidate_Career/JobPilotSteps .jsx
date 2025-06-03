import React, { useState } from "react";

const JobPilotSteps = () => {
  const steps = [
    {
      title: "Create account",
      desc: "Aliquam facilisis egestas sapien, nec tempor leo tristique at.",
      icon: "👤",
      count: 1,
    },
    {
      title: "Upload CV/Resume",
      desc: "Curabitur sit amet maximus ligula. Nam a nulla ante.",
      icon: "⬆️",
      active: true,
      count: 2,
    },
    {
      title: "Find suitable job",
      desc: "Phasellus quis eleifend ex. Morbi nec fringilla nibh.",
      icon: "🔍",
      count: 3,
    },
    {
      title: "Apply job",
      desc: "Curabitur sit amet maximus ligula. Nam sodales purus.",
      icon: "✅",
      count: 4,
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    setCurrentStep((prevStep) => (prevStep + 1) % steps.length);
  };

  return (
    <div className="p-8 font-sans text-center">
      <div className="text-2xl font-bold mb-8">How JobPilot works</div>

      <div className="hidden md:flex justify-center items-start gap-[86px] flex-wrap">
        {steps.map((step, index) => (
          <div
            key={index}
            className="max-w-[190px] p-5 bg-white rounded-xl shadow-md relative"
          >
            <div
              className={`w-10 h-10 rounded-full flex justify-center items-center mb-3 mx-auto ${
                step.active
                  ? "bg-[#2563eb] text-white"
                  : "bg-[#f4f5f7] text-[#2563eb]"
              }`}
            >
              {step.icon}
            </div>
            <div className="text-sm font-semibold mb-1">{step.title}</div>
            <div className="text-xs text-[#6b7280]">{step.desc}</div>
            <div className="absolute top-2 right-2 text-xs font-bold text-[#2563eb]">
              {step.count}
            </div>
          </div>
        ))}
      </div>

     {/* Mobile View: Next button and count */}
<div className="md:hidden px-4">
  <div className="w-full p-5 bg-white rounded-xl shadow-md relative">
    <div
      className={`w-10 h-10 rounded-full flex justify-center items-center mb-3 mx-auto ${
        steps[currentStep].active
          ? "bg-[#2563eb] text-white"
          : "bg-[#f4f5f7] text-[#2563eb]"
      }`}
    >
      {steps[currentStep].icon}
    </div>
    <div className="text-sm font-semibold mb-1">
      {steps[currentStep].title}
    </div>
    <div className="text-xs text-[#6b7280]">{steps[currentStep].desc}</div>
    <div className="absolute top-2 right-2 text-xs font-bold text-[#2563eb]">
      {steps[currentStep].count}
    </div>
    <button
      onClick={handleNext}
      className="mt-6 px-4 py-2 bg-[#2563eb] text-white rounded-lg flex items-center mx-auto"
    >
      Next
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="ml-2 w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 12h14M12 5l7 7-7 7"
        />
      </svg>
    </button>
  </div>
</div>

    </div>
  );
};

export default JobPilotSteps;
