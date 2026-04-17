import { AppState, BudgetTarget } from "../lib/types";
import BudgetSliders from "../components/BudgetSliders";
import Roadmap from "../components/Roadmap";

export default function Plan(props: {
  state: AppState;
  nowISO: string;
  setState: (next: AppState) => void;
}) {
  function updateBudgets(next: BudgetTarget[]) {
    props.setState({ ...props.state, budgets: next });
  }

  return (
    <div className="grid cols-2">
      <BudgetSliders budgets={props.state.budgets} onChange={updateBudgets} />
      <Roadmap state={props.state} nowISO={props.nowISO} />
    </div>
  );
}
