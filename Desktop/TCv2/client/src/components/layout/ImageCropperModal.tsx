interface Props {
  imageUrl: string;
  onCrop: (file: File) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({
  imageUrl,
  onCrop,
  onCancel,
}: Props) {
  const handleDummyCrop = async () => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const file = new File([blob], "cropped-image.png", {
      type: "image/png",
    });

    onCrop(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px]">
        <h2 className="text-lg font-bold mb-4">Image Cropper</h2>

        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-64 object-cover rounded-lg mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleDummyCrop}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}