import { useState, useEffect, useRef } from "react";

type TitleEditorProps = {
  title: string;
  onUpdate: (title: string) => void;
};

export function TitleEditor({ title, onUpdate }: TitleEditorProps) {
  const [value, setValue] = useState(title);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setValue(title);
  }, [title]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Debounce the update
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onUpdate(newValue);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Untitled"
      className="w-full text-3xl font-bold text-gray-900 border-none outline-none bg-transparent placeholder-gray-400"
    />
  );
}
