export const resources = [
  { id: "K1", name: "耐压检测台 01", stage: "耐压检测" },
  { id: "K2", name: "耐压检测台 02", stage: "耐压检测" },
  { id: "A1", name: "功能检测台 01", stage: "功能检测" },
  { id: "A2", name: "功能检测台 02", stage: "功能检测" },
  { id: "A3", name: "功能检测台 03", stage: "功能检测" },
  { id: "A4", name: "功能检测台 04", stage: "功能检测" },
  { id: "C1", name: "FAT 验收台 01", stage: "FAT 验收" },
  { id: "C2", name: "FAT 验收台 02", stage: "FAT 验收" },
];

export const orders = Array.from({ length: 18 }, (_, i) => ({
  id: `T-${String(i + 1).padStart(3, "0")}`,
  product: ["样品检测 A", "样品检测 B", "样品检测 C"][i % 3]!,
  line: i % 2 === 0 ? "一号产线" : "二号产线",
  priority: i % 5 === 0 ? "紧急" : i % 3 === 0 ? "优先" : "普通",
  fat: i % 3 !== 1,
  due: 300 + (i % 6) * 45,
  voltage: 25 + (i % 3) * 10,
  functional: 40 + (i % 4) * 10,
  acceptance: 30 + (i % 3) * 10,
}));

export type Order = (typeof orders)[number];
export type Operation = {
  orderId: string;
  resource: string;
  stage: string;
  start: number;
  end: number;
  priority: string;
};
export type ScheduleResult = ReturnType<typeof schedule>;

// 本地原型使用串行工序、同类资源最早可用规则；并非生产排程服务。
export function schedule(line: string, strategy: string) {
  const selected = orders.filter((order) => line === "全部产线" || order.line === line);
  const rank: Record<string, number> = { 紧急: 0, 优先: 1, 普通: 2 };
  const sorted = [...selected].sort((a, b) =>
    strategy === "交期优先"
      ? a.due - b.due
      : strategy === "最短工时优先"
        ? a.voltage +
          a.functional +
          (a.fat ? a.acceptance : 0) -
          b.voltage -
          b.functional -
          (b.fat ? b.acceptance : 0)
        : rank[a.priority]! - rank[b.priority]! || a.due - b.due
  );
  const available: Record<string, number> = Object.fromEntries(resources.map((r) => [r.id, 0]));
  const operations: Operation[] = [];
  const rows = sorted.map((order) => {
    let ready = 0;
    const steps = [
      { stage: "耐压检测", duration: order.voltage },
      { stage: "功能检测", duration: order.functional },
    ];
    if (order.fat) steps.push({ stage: "FAT 验收", duration: order.acceptance });
    for (const step of steps) {
      const resource = resources
        .filter((r) => r.stage === step.stage)
        .sort((a, b) => available[a.id]! - available[b.id]!)[0]!;
      const start = Math.max(ready, available[resource.id]!);
      const end = start + step.duration;
      operations.push({
        orderId: order.id,
        resource: resource.id,
        stage: step.stage,
        start,
        end,
        priority: order.priority,
      });
      available[resource.id] = end;
      ready = end;
    }
    const own = operations.filter((op) => op.orderId === order.id);
    return {
      ...order,
      start: own[0]!.start,
      end: ready,
      route: own.map((op) => op.resource).join(" → "),
      late: ready > order.due,
    };
  });
  const makespan = Math.max(0, ...rows.map((row) => row.end));
  const busy = operations.reduce((total, op) => total + op.end - op.start, 0);
  return {
    rows,
    operations,
    makespan,
    utilization: makespan ? Math.round((busy / (makespan * resources.length)) * 100) : 0,
    onTime: rows.length
      ? Math.round((rows.filter((row) => !row.late).length / rows.length) * 100)
      : 0,
  };
}
