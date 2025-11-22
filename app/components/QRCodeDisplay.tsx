"use client";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeDisplay({ url }: { url: string }) {
  return (
    <div className="mt-2">
      <QRCodeCanvas
        value={url}
        size={80}
        bgColor="#ffffff"
        fgColor="#000000"
        level="Q"
      />
    </div>
  );
}
