const os = require("os");

const detectOSType = () => {
  const type = os.type();
  if (type.startsWith("Windows")) return "Windows";
  if (type.startsWith("Linux")) return "Linux";
  return "Unknown";
};

module.exports = {
  detectOSType,
};
