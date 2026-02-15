import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

export function BirdFeeConfig({ config, onChange }) {
    const [localConfig, setLocalConfig] = useState({
        minimumBudget: 0,
        maximumBudget: 0,
        feeStructure: [],
    });

    useEffect(() => {
        if (config) {
            // Ensure structure exists even if passed object is partial or old format
            setLocalConfig({
                minimumBudget: config.minimumBudget || 0,
                maximumBudget: config.maximumBudget || 0,
                feeStructure: Array.isArray(config.feeStructure) ? config.feeStructure : []
            });
        }
    }, [config]);

    const updateConfig = (newConfig) => {
        setLocalConfig(newConfig);
        onChange(newConfig);
    };

    const handleGlobalChange = (e) => {
        const { name, value } = e.target;
        updateConfig({
            ...localConfig,
            [name]: parseFloat(value) || 0,
        });
    };

    const addBracket = () => {
        const newBracket = {
            minAmount: 0,
            maxAmount: 0,
            feeType: "FIXED",
            feeValue: 0,
        };
        updateConfig({
            ...localConfig,
            feeStructure: [...localConfig.feeStructure, newBracket],
        });
    };

    const removeBracket = (index) => {
        const newStructure = localConfig.feeStructure.filter((_, i) => i !== index);
        updateConfig({
            ...localConfig,
            feeStructure: newStructure,
        });
    };

    const updateBracket = (index, field, value) => {
        const newStructure = [...localConfig.feeStructure];
        newStructure[index] = {
            ...newStructure[index],
            [field]: field === "feeType" ? value : (parseFloat(value) || 0),
        };
        updateConfig({
            ...localConfig,
            feeStructure: newStructure,
        });
    };

    return (
        <div className="space-y-4 border rounded-md p-4 bg-muted/10">
            <h3 className="font-medium">Bird Fee Configuration</h3>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="minimumBudget">Minimum Budget (Global)</Label>
                    <Input
                        id="minimumBudget"
                        name="minimumBudget"
                        type="number"
                        value={localConfig.minimumBudget}
                        onChange={handleGlobalChange}
                        min="0"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maximumBudget">Maximum Budget (Global)</Label>
                    <Input
                        id="maximumBudget"
                        name="maximumBudget"
                        type="number"
                        value={localConfig.maximumBudget}
                        onChange={handleGlobalChange}
                        min="0"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Fee Brackets</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addBracket}>
                        <Plus className="w-4 h-4 mr-1" /> Add Bracket
                    </Button>
                </div>

                {localConfig.feeStructure.length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                        No fee brackets defined.
                    </p>
                )}

                <div className="space-y-2">
                    {localConfig.feeStructure.map((bracket, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end border p-2 rounded bg-background">
                            <div className="col-span-2 space-y-1">
                                <Label className="text-xs">Min</Label>
                                <Input
                                    type="number"
                                    value={bracket.minAmount}
                                    onChange={(e) => updateBracket(index, "minAmount", e.target.value)}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label className="text-xs">Max</Label>
                                <Input
                                    type="number"
                                    value={bracket.maxAmount}
                                    onChange={(e) => updateBracket(index, "maxAmount", e.target.value)}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="col-span-3 space-y-1">
                                <Label className="text-xs">Type</Label>
                                <Select
                                    value={bracket.feeType}
                                    onValueChange={(value) => updateBracket(index, "feeType", value)}
                                >
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-3 space-y-1">
                                <Label className="text-xs">Value</Label>
                                <Input
                                    type="number"
                                    value={bracket.feeValue}
                                    onChange={(e) => updateBracket(index, "feeValue", e.target.value)}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="col-span-2 flexjustify-end pb-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                                    onClick={() => removeBracket(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
