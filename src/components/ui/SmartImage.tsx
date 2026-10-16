import Image from "next/image";

// next/image sarmalayıcı: optimize edilebilen yerel dosyalar (jpg/png/webp)
// /_next/image üzerinden WebP/AVIF olarak sunulur; SVG, harici URL ve
// data-URL'ler olduğu gibi <img> ile geçilir.
export default function SmartImage({
  src,
  alt,
  width,
  height,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  eager?: boolean;
}) {
  const optimizable =
    !src.endsWith(".svg") && !src.startsWith("http") && !src.startsWith("data:");

  if (!optimizable) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      className={className}
    />
  );
}
