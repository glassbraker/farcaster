export function addGrayBar(name: string, positionPercent: number) {
  const clampedPos = Math.max(0, Math.min(100, positionPercent));

  // Create bar element
  const bar = document.createElement("div");
  bar.innerText = name;
  bar.style.position = "fixed";
  bar.style.left = "0";
  bar.style.right = "0";
  bar.style.height = "20px";
  bar.style.backgroundColor = "gray";
  bar.style.color = "white";
  bar.style.display = "flex";
  bar.style.alignItems = "center";
  bar.style.justifyContent = "left";
  bar.style.top = `${clampedPos}%`;
  bar.style.transform = "translateY(-50%)";
  bar.style.zIndex = "9999";
  bar.style.fontSize = "16px";
  bar.style.fontFamily = "sans-serif";
  bar.style.borderRadius = "4px";

  document.body.appendChild(bar);
}
