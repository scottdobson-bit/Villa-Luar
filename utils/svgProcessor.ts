export const processSvg = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onerror = reject;
    reader.onload = (event) => {
      try {
        const svgText = event.target?.result as string;
        
        // Convert SVG to a data URL without stripping colors
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgText)}`;
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
  });
};