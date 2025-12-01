import { useState } from 'react';
import AnswerOption from '../AnswerOption';

export default function AnswerOptionExample() {
  const [selected, setSelected] = useState(3);

  return (
    <div className="space-y-4 max-w-2xl">
      <AnswerOption
        value={1}
        label="Rarely, I mostly start directly with screens"
        isSelected={selected === 1}
        onClick={() => setSelected(1)}
      />
      <AnswerOption
        value={3}
        label="Often, but metrics are vague"
        isSelected={selected === 3}
        onClick={() => setSelected(3)}
      />
      <AnswerOption
        value={5}
        label="Always, I write a clear problem, constraints, and success metrics"
        isSelected={selected === 5}
        onClick={() => setSelected(5)}
      />
    </div>
  );
}
