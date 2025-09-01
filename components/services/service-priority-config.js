import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ServicePriorityConfig({ config, onChange }) {
  const handleChange = (key, value) => {
    const numValue = parseInt(value) || 0;
    onChange({
      ...config,
      [key]: numValue,
    });
  };

  const secondsToDays = (seconds) => {
    return seconds / (24 * 60 * 60);
  };

  const daysToSeconds = (days) => {
    return days * 24 * 60 * 60;
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="priority-config">
        <AccordionTrigger>Priority Configuration</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="immediate">
                Immediate Priority (Days)
                <span className="text-sm text-gray-500 ml-2">
                  Current: {secondsToDays(config.immediate).toFixed(1)} days
                </span>
              </Label>
              <Input
                id="immediate"
                type="number"
                value={secondsToDays(config.immediate)}
                onChange={(e) =>
                  handleChange("immediate", daysToSeconds(e.target.value))
                }
                min="0.1"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="high">
                High Priority (Days)
                <span className="text-sm text-gray-500 ml-2">
                  Current: {secondsToDays(config.high).toFixed(1)} days
                </span>
              </Label>
              <Input
                id="high"
                type="number"
                value={secondsToDays(config.high)}
                onChange={(e) =>
                  handleChange("high", daysToSeconds(e.target.value))
                }
                min="0.1"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="standard" className="flex items-center">
                Standard Priority
                <span className="text-sm text-gray-500 ml-2 italic">
                  (Automatically set for deadlines longer than {secondsToDays(config.high)} days)
                </span>
              </Label>
              <Input
                id="standard"
                type="number"
                value={secondsToDays(config.standard)}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="text-sm text-gray-500 mt-4 bg-gray-50 p-4 rounded-md border">
              <p className="font-medium mb-2">How Priority Works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Immediate Priority: Jobs due within {secondsToDays(config.immediate)} days</li>
                <li>High Priority: Jobs due within {secondsToDays(config.high)} days</li>
                <li>Standard Priority: All jobs with deadlines beyond {secondsToDays(config.high)} days</li>
              </ul>
              <p className="mt-2 text-xs italic">
                Note: Standard priority is automatically assigned and cannot be configured
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
