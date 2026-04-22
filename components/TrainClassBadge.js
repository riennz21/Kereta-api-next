import { getClassClass } from "../lib/train-utils";

export default function TrainClassBadge({ trainClass }) {
  return <span className={`badge badge-class ${getClassClass(trainClass)}`}>{trainClass || "-"}</span>;
}
