import AI_Agent from "../assets/ai_assistant.png";

const agentic_ai_url = import.meta.env.VITE_AGENTIC_AI;

const AgenticAIButton = () => {
  const handleClick = () => {
    window.open(agentic_ai_url, "_blank");
  };

  return (
    <div
      onClick={handleClick}
      className="fixed bottom-6 right-6 flex items-center gap-3 cursor-pointer z-50"
    >
      {/* Label (always visible) */}
      <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-md 
                      whitespace-nowrap text-sm font-medium
                      transition-all duration-300
                      hover:shadow-[0_0_15px_rgba(59,130,246,0.8)]">
        Nexus AI Assistant
      </div>

      {/* Circular Button */}
      <div className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full 
                      flex items-center justify-center shadow-lg 
                      transition-all duration-300 
                      hover:shadow-[0_0_20px_rgba(59,130,246,0.9)]">
        <img
          src={AI_Agent}
          alt="AI Assistant"
          className="w-10 h-10 object-contain"
        />
      </div>
    </div>
  );
};

export default AgenticAIButton;