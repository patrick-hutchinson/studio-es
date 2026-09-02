import NextImage from "next/image";

const Placeholder = ({ medium, className, isLoaded, onError, onLoad, persistent = false }) => {
  let src;

  medium.type === "image"
    ? (src = `${medium.url}?w=20&fit=crop&auto=format`)
    : (src = `https://image.mux.com/${medium.playbackId}/thumbnail.jpg?width=50`);

  return (
    <NextImage
      className={className}
      src={src}
      fill
      loading="eager"
      onError={onError}
      onLoad={onLoad}
      alt="placeholder image"
      style={{
        position: "absolute",

        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        filter: "blur(20px) brightness(1.3)",
        transform: "scale(1.5)",
        opacity: persistent || !isLoaded ? 1 : 0,
        transition: "opacity 0.5s ease 0.5s",
        zIndex: persistent ? 0 : 3,
      }}
    />
  );
};

export default Placeholder;
