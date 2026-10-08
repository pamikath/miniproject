"use client";

import { useState, useMemo } from "react";
import { Order } from "@/lib/types";
import { TrendingUp, Calendar, DollarSign, ShoppingBag, ArrowUpRight } from "lucide-react";

interface SalesLineChartProps {
  orders: Order[];
}

const MONTH_NAMES = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const MONTH_FULL_NAMES = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export default function SalesLineChart({ orders }: SalesLineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  // Aggregate sales by month
  const monthlyData = useMemo(() => {
    const data = MONTH_NAMES.map((m, idx) => ({
      month: m,
      fullMonth: MONTH_FULL_NAMES[idx],
      index: idx,
      sales: 0,
      ordersCount: 0,
    }));

    orders.forEach((order) => {
      let monthIndex = -1;

      // Extract month from Thai date format e.g. "15 มิ.ย. 2567"
      if (order.date) {
        for (let i = 0; i < MONTH_NAMES.length; i++) {
          if (order.date.includes(MONTH_NAMES[i])) {
            monthIndex = i;
            break;
          }
        }
      }

      // If not found in date string, check createdAt ISO
      if (monthIndex === -1 && order.createdAt) {
        try {
          const d = new Date(order.createdAt);
          if (!isNaN(d.getTime())) {
            monthIndex = d.getMonth();
          }
        } catch {}
      }

      // Default fallback based on order id or hash if missing
      if (monthIndex === -1) {
        monthIndex = 5; // default June
      }

      if (monthIndex >= 0 && monthIndex < 12) {
        data[monthIndex].sales += order.netAmount || order.totalAmount || 0;
        data[monthIndex].ordersCount += 1;
      }
    });

    return data;
  }, [orders]);

  // Overall statistics
  const totalSales = monthlyData.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = monthlyData.reduce((sum, d) => sum + d.ordersCount, 0);
  const maxSales = Math.max(...monthlyData.map((d) => d.sales), 1000);
  const topMonth = [...monthlyData].sort((a, b) => b.sales - a.sales)[0];
  const activeMonthsCount = monthlyData.filter((d) => d.sales > 0).length || 1;
  const avgMonthlySales = Math.round(totalSales / activeMonthsCount);

  // SVG Chart Dimensions
  const width = 800;
  const height = 280;
  const paddingX = 50;
  const paddingY = 40;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates for points
  const points = monthlyData.map((d, i) => {
    const x = paddingX + (i / (monthlyData.length - 1)) * chartWidth;
    const y = height - paddingY - (d.sales / maxSales) * chartHeight;
    return { x, y, ...d };
  });

  // Generate Smooth Curve Path using Bezier Curves
  const generateSmoothPath = (pts: typeof points) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - paddingY
  } L ${points[0].x} ${height - paddingY} Z`;

  // Grid lines
  const gridLinesCount = 4;
  const gridLines = Array.from({ length: gridLinesCount + 1 }).map((_, i) => {
    const yVal = (i / gridLinesCount) * maxSales;
    const yPos = height - paddingY - (i / gridLinesCount) * chartHeight;
    return { yVal, yPos };
  });

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-6">
      {/* Chart Top Header & KPIs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              กราฟเส้นยอดขายรายเดือน (Monthly Revenue Trend)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            สถิติยอดจำหน่ายสินค้าดิจิทัลในแต่ละเดือน คำนวณจากคำสั่งซื้อจริง
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
            <span className="text-[10px] text-slate-400 block">ยอดขายรวม</span>
            <span className="text-xs font-bold text-purple-600">
              ฿{totalSales.toLocaleString()}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left">
            <span className="text-[10px] text-slate-400 block">เฉลี่ยต่อเดือน</span>
            <span className="text-xs font-bold text-slate-800">
              ฿{avgMonthlySales.toLocaleString()}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200/60 text-left">
            <span className="text-[10px] text-purple-500 block">เดือนขายดีสุด</span>
            <span className="text-xs font-bold text-purple-700">
              {topMonth ? `${topMonth.month} (฿${topMonth.sales.toLocaleString()})` : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Linear Gradient for Line Area Fill */}
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>

            {/* Linear Gradient for Line Stroke */}
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={line.yPos}
                x2={width - paddingX}
                y2={line.yPos}
                stroke="#f1f5f9"
                strokeWidth="1.5"
                strokeDasharray={idx === 0 ? "none" : "3 3"}
              />
              <text
                x={paddingX - 10}
                y={line.yPos + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono"
              >
                ฿{Math.round(line.yVal).toLocaleString()}
              </text>
            </g>
          ))}

          {/* Area Fill under the curve */}
          <path d={areaPath} fill="url(#salesGrad)" />

          {/* Smooth Curved Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical Indicator on hover */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingY}
              x2={activePoint.x}
              y2={height - paddingY}
              stroke="#9333ea"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-70"
            />
          )}

          {/* Interactive Data Points (Dots) & X-Axis Month Labels */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={i}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Invisible hit area for easier mouse hover */}
                <rect
                  x={pt.x - chartWidth / 24}
                  y={0}
                  width={chartWidth / 12}
                  height={height}
                  fill="transparent"
                />

                {/* Month label on X Axis */}
                <text
                  x={pt.x}
                  y={height - paddingY + 20}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered
                      ? "fill-purple-700 font-bold"
                      : "fill-slate-500 hover:fill-slate-900"
                  }`}
                >
                  {pt.month}
                </text>

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  y={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? "#9333ea" : "#ffffff"}
                  stroke="#9333ea"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150 shadow-sm"
                />
                {isHovered && (
                  <circle
                    cx={pt.x}
                    y={pt.y}
                    r={10}
                    fill="#9333ea"
                    className="opacity-20 animate-ping"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {activePoint && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-100 z-20"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100 - 4}%`,
            }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-xl text-left border border-slate-700/60 min-w-[140px]">
              <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1 mb-1">
                <span className="text-[10px] text-purple-300 font-bold uppercase">
                  {activePoint.fullMonth}
                </span>
                <span className="text-[10px] text-slate-400">
                  {activePoint.ordersCount} คำสั่งซื้อ
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-slate-400 font-light">ยอดขาย:</span>
                <span className="text-sm font-extrabold text-amber-400">
                  ฿{activePoint.sales.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Month-by-Month Mini Table Breakdown */}
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 pt-2 border-t border-slate-100 text-center">
        {monthlyData.map((d, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              hoveredIndex === i
                ? "bg-purple-50 border-purple-300 shadow-xs"
                : "bg-slate-50/70 border-slate-100 hover:bg-slate-100/60"
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-medium">
              {d.month}
            </span>
            <span
              className={`text-xs font-bold block ${
                d.sales > 0 ? "text-slate-800" : "text-slate-400 font-normal"
              }`}
            >
              {d.sales > 0 ? `฿${d.sales.toLocaleString()}` : "฿0"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
