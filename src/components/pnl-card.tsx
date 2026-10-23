"use client";

import { useCallback, useMemo, useState } from "react";
import { Download } from "lucide-react";

type Signal = {
  symbol?: string;
  direction?: string;
  entry?: number | string | null;
  price?: number | string | null;
  mark?: number | string | null;
  stop?: number | string | null;
  leverage?: number | string | null;
  positionLeverage?: number | string | null;
  marginLeverage?: number | string | null;
  setup?: { leverage?: number | string | null };
  targets?: Array<{ price?: number | string | null }>;
  pnlPercent?: number | string | null;
  unrealizedPnlPercent?: number | string | null;
};

type Props = { signal: Signal; username?: string };

const BLUE = "#4f7cff";
const RED = "#ef4444";

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function price(value: unknown) {
  const n = num(value);
  return n == null ? "—" : n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function pair(value: unknown) {
  const raw = String(value || "—").toUpperCase().replace(/\s+/g, "");
  return raw.endsWith("USDT") ? `${raw.slice(0, -4)}/USDT` : raw;
}

function leverage(signal: Signal) {
  return num(signal.leverage ?? signal.positionLeverage ?? signal.marginLeverage ?? signal.setup?.leverage) ?? 1;
}

function pnlPercent(signal: Signal) {
  const supplied = num(signal.pnlPercent ?? signal.unrealizedPnlPercent);
  if (supplied != null) return supplied;
  const entry = num(signal.entry);
  const mark = num(signal.mark ?? signal.price);
  if (entry == null || mark == null || entry === 0) return null;
  const move = String(signal.direction || "").toUpperCase() === "SHORT"
    ? (entry - mark) / entry
    : (mark - entry) / entry;
  return move * leverage(signal) * 100;
}

function escape(value: unknown) {
  return String(value ?? "—").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  }[c] || c));
}

function svgFor(signal: Signal, username: string) {
  const pnl = pnlPercent(signal);
  const profit = (pnl ?? 0) >= 0;
  const color = profit ? BLUE : RED;
  const arrow = profit ? "↗" : "↘";
  const direction = String(signal.direction || "—").toUpperCase();
  const title = `${pair(signal.symbol)} · ${direction.charAt(0) + direction.slice(1).toLowerCase()}`;
  const pnlText = pnl == null ? "—" : `${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}%`;
  const values = [
    ["Entry", price(signal.entry)],
    ["Mark", price(signal.mark ?? signal.price)],
    ["Leverage", `${leverage(signal)}x`],
    ["SL", price(signal.stop)],
    ["TP", price(signal.targets?.[0]?.price)],
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1277" viewBox="0 0 1080 1277">
  <defs>
    <radialGradient id="g" cx="72%" cy="53%" r="52%"><stop offset="0" stop-color="#0b3b37" stop-opacity=".62"/><stop offset=".42" stop-color="#06221f" stop-opacity=".26"/><stop offset="1" stop-color="#050708" stop-opacity="0"/></radialGradient>
    <linearGradient id="e" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b5d60"/><stop offset=".5" stop-color="#12373a"/><stop offset="1" stop-color="#071d20"/></linearGradient>
  </defs>
  <rect width="1080" height="1277" fill="#050708"/>
  <rect x="57" y="16" width="966" height="1245" rx="50" fill="#050708" stroke="url(#e)" stroke-width="2.5"/>
  <rect x="84" y="43" width="913" height="1214" rx="3" fill="url(#g)" stroke="#0b3538" stroke-width="2"/>
  <circle cx="807" cy="630" r="408" fill="none" stroke="#0b4548" stroke-opacity=".78" stroke-width="2"/>
  <path d="M397 628 A410 410 0 0 1 997 266" fill="none" stroke="#0b4548" stroke-opacity=".72" stroke-width="2"/>
  <path d="M407 628 A407 407 0 0 0 997 994" fill="none" stroke="#0b4548" stroke-opacity=".72" stroke-width="2"/>

  <rect x="156" y="288" width="94" height="94" rx="22" fill="#27c9c2"/>
  <text x="203" y="351" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="47" font-weight="700" fill="#071112">K</text>
  <text x="275" y="311" font-family="Arial,Helvetica,sans-serif" font-size="24" font-weight="700" letter-spacing="3.5" fill="#27d1c7">KITSETUPS FUTURES</text>
  <text x="275" y="367" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="600" fill="#f4f5f6">${escape(username || "KitSetups user")}</text>

  <circle cx="865" cy="228" r="58" fill="#101718" stroke="#687272" stroke-width="2"/>
  <circle cx="865" cy="228" r="51" fill="#14191a"/>
  <path d="M831 213 C833 185 852 178 870 181 C892 184 900 201 897 223 C894 245 880 261 862 260 C844 259 833 243 831 213Z" fill="#f2cfae"/>
  <path d="M829 205 C831 181 850 171 871 171 C891 171 903 186 902 202 L892 196 L885 186 L878 195 L868 183 L860 195 L851 184 L844 197 L834 191Z" fill="#b18a3e"/>
  <path d="M844 215 C850 211 855 211 860 214 M873 214 C878 211 884 211 889 214" fill="none" stroke="#151313" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M858 238 C864 242 870 242 875 238" fill="none" stroke="#b84e64" stroke-width="2" stroke-linecap="round"/>

  <text x="156" y="518" font-family="Arial,Helvetica,sans-serif" font-size="52" font-weight="700" letter-spacing="-2.2" fill="#f6f7f8">${escape(title)}</text>
  <text x="179" y="722" font-family="Arial,Helvetica,sans-serif" font-size="86" fill="${color}">${arrow}</text>
  <text x="306" y="732" font-family="Arial,Helvetica,sans-serif" font-size="174" font-weight="800" letter-spacing="-5" fill="${color}">${escape(pnlText)}</text>
  <text x="156" y="861" font-family="Arial,Helvetica,sans-serif" font-size="108" font-weight="800" letter-spacing="-4" fill="${color}">PNL</text>
  <text x="156" y="948" font-family="Arial,Helvetica,sans-serif" font-size="24" letter-spacing="4.2" fill="#84919f">UNREALIZED PNL</text>

  <line x1="156" y1="1027" x2="924" y2="1027" stroke="#242829" stroke-width="2"/>
  <line x1="309.6" y1="1027" x2="309.6" y2="1205" stroke="#242829" stroke-width="2"/>
  <line x1="463.2" y1="1027" x2="463.2" y2="1205" stroke="#242829" stroke-width="2"/>
  <line x1="616.8" y1="1027" x2="616.8" y2="1205" stroke="#242829" stroke-width="2"/>
  <line x1="770.4" y1="1027" x2="770.4" y2="1205" stroke="#242829" stroke-width="2"/>
  <line x1="156" y1="1205" x2="924" y2="1205" stroke="#242829" stroke-width="2"/>
  ${values.map(([label, value], index) => {
    const x = 156 + index * 153.6;
    return `<text x="${x}" y="1080" font-family="Arial,Helvetica,sans-serif" font-size="22" fill="#f1f3f5">${label}</text><text x="${x}" y="1152" font-family="Arial,Helvetica,sans-serif" font-size="27" font-weight="700" fill="#eef0f2">${escape(value)}</text>`;
  }).join("")}
</svg>`;
}

export default function PnlCard({ signal, username }: Props) {
  const [downloading, setDownloading] = useState(false);
  const svg = useMemo(() => svgFor(signal, username || "KitSetups user"), [signal, username]);

  const download = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const source = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
      const image = new Image();
      image.src = source;
      await image.decode();

      const canvas = document.createElement("canvas");
      canvas.width = 2160;
      canvas.height = 2554;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const png = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG export failed")), "image/png", 1);
      });
      const pngUrl = URL.createObjectURL(png);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `kitsetups-${pair(signal.symbol).replace("/", "-").toLowerCase()}-pnl.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(pngUrl);
      URL.revokeObjectURL(source);
    } finally {
      setDownloading(false);
    }
  }, [downloading, signal.symbol, svg]);

  return (
    <section className="w-full">
      <div className="overflow-hidden rounded-[28px] bg-[#050708] shadow-[0_20px_70px_rgba(0,0,0,.4)]">
        <div className="aspect-[1080/1277] w-full" dangerouslySetInnerHTML={{ __html: svg.replace("<svg ", '<svg preserveAspectRatio="xMidYMid meet" class="block h-full w-full" ') }} />
      </div>
      <button type="button" onClick={() => void download()} disabled={downloading} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-medium text-zinc-300 transition hover:border-cyan-400/25 hover:text-cyan-200 disabled:cursor-wait disabled:opacity-50">
        <Download className="h-4 w-4" />
        {downloading ? "Preparing card…" : "Download PNL card"}
      </button>
    </section>
  );
}
