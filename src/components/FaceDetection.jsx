export default function CameraStream({ camUrl }) {
  if (!camUrl) return null;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">Live Camera Stream</h2>
      <img
        src={camUrl}
        alt="Live Stream"
        style={{ width: "480px", borderRadius: "10px" }}
      />
    </div>
  );
}
