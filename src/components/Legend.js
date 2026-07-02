import classColorMap from "../constants/classColorMap";

const Legend = () => (
  <div className="bg-white rounded-xl shadow-md p-2">
    <h3 className="font-semibold mb-1">Legenda</h3>
    <ul className="space-y-1">
      {Object.entries(classColorMap).map(([id, { label, color }]) => (
        <li key={id} className="flex items-center gap-3">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
          <span className="text-xs font-normal text-gray-500">{label}</span>
        </li>
      ))}
    </ul>
  </div>
);
export default Legend;
  