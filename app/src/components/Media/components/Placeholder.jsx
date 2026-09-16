import NextImage from "next/image";

const Placeholder = ({ medium, className, isLoaded, onError, onLoad, persistent = false, placeholderColor }) => {
  let src;

  medium.type === "image"
    ? (src = `${medium.url}?w=20&fit=crop&auto=format`)
    : (src = `https://image.mux.com/${medium.playbackId}/thumbnail.jpg?width=50`);

  const style = {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    opacity: persistent || !isLoaded ? 1 : 0,
    transition: "opacity 0.5s ease 0.5s",
    zIndex: persistent ? 0 : 3,
  };

  if (placeholderColor) {
    return <div aria-hidden="true" className={className} style={{ ...style, backgroundColor: placeholderColor }} />;
  }

  return (
    <NextImage
      className={className}
      src={src}
      fill
      draggable={false}
      loading="eager"
      onError={onError}
      onLoad={onLoad}
      alt="placeholder image"
      style={{ ...style, filter: "blur(20px) brightness(1.3)", transform: "scale(1.5)" }}
    />
  );
};

export default Placeholder;
