import { defineMock } from "./base";

const employees = {
  A: [
    ["A001", "张伟", 12, 10, 2],
    ["A002", "李娜", 14, 11, 3],
    ["A003", "王强", 10, 8, 2],
  ],
  B: [
    ["B001", "陈杰", 15, 12, 3],
    ["B002", "赵敏", 13, 9, 4],
  ],
  C: [
    ["C001", "周磊", 18, 14, 4],
    ["C002", "孙芳", 16, 12, 4],
  ],
  D: [
    ["D001", "刘洋", 14, 11, 3],
    ["D002", "黄静", 14, 11, 3],
  ],
} as const;

const totals = {
  A: [36, 29, 7],
  B: [28, 21, 7],
  C: [34, 26, 8],
  D: [28, 22, 6],
} as const;

const formatDateTime = () => {
  const now = new Date();
  const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((value, index) => (index === 0 ? String(value) : String(value).padStart(2, "0")))
    .join("-");
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
  return `${date} ${time}`;
};

export default defineMock([
  {
    url: "fqc/function-output/overview",
    method: ["GET"],
    body({ query }) {
      const selectedTeam = String(query.empTeam || "");
      const empName = String(query.empName || "").trim();
      const groups = (["A", "B", "C", "D"] as const).map((empTeam) => {
        const [assignedCount, completedCount, incompleteCount] = totals[empTeam];
        const employeesForTeam = employees[empTeam]
          .map(([empId, name, allocated, completed, incomplete]) => ({
            empId,
            empName: name,
            empTeam,
            assignedCount: allocated,
            completedCount: completed,
            incompleteCount: incomplete,
          }))
          .filter(
            (employee) =>
              (!selectedTeam || selectedTeam === empTeam) && employee.empName.includes(empName)
          );
        return {
          empTeam,
          assignedCount,
          completedCount,
          incompleteCount,
          employees: employeesForTeam,
        };
      });

      return {
        code: 200,
        msg: "success",
        data: {
          statDate: String(query.statDate || "2026-08-14"),
          fqcDailyInput: 132,
          fqcFunctionTestOutput: 98,
          updateTime: formatDateTime(),
          groups,
        },
      };
    },
  },
]);
