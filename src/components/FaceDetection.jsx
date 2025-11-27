export default function FaceDetection({ camUrl }) {
  if (!camUrl) return null;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">Live Camera Stream</h2>
      <img
        src={camUrl}
        alt="Live Stream"
        style={{ width: "800px",height: "450px", borderRadius: "10px" }}
      />
    </div>
  );
}
