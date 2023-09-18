function TextArea({ value, setValue }) {
  return (
    <textarea
      className="w-full h-full bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 
p-3 font-semibold resize-none"
      placeholder="Aa..."
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
    ></textarea>
  );
}

export default TextArea;
