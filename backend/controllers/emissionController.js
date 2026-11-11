// Illustrative demo factors only.
// Replace these with verified factors appropriate to
// your reporting standard, location, fuel and activity unit.

const emissionFactors = {
    electricity: 0.70,
    diesel: 2.68,
    petrol: 2.31,
    naturalGas: 2.0,
    airFreight: 0.60,
    roadFreight: 0.12,
    water: 0.0003,
    waste: 0.45
};

exports.calculateEmission = async (req, res) => {
    try {
        const { category, quantity } = req.body;

        const amount = Number(quantity);

        if (!category || !Number.isFinite(amount) || amount < 0) {
            return res.status(400).json({
                message: "Enter a valid category and quantity"
            });
        }

        const factor = emissionFactors[category];

        if (factor === undefined) {
            return res.status(400).json({
                message: "Unsupported emission category"
            });
        }

        const emissions = amount * factor;

        res.json({
            category,
            quantity: amount,
            emissionFactor: factor,
            emissionsKgCO2e: Number(emissions.toFixed(2)),
            unit: "kg CO2e",
            note: "Illustrative demo estimate, not a verified inventory result."
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};