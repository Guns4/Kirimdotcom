// Safe Math Utility - Prevents JavaScript floating point errors
// Always use this for money calculations

export class IDR {
    private amount: number;

    constructor(value: number) {
        // Round down to eliminate decimal ghosts
        this.amount = Math.floor(value);
    }

    add(value: number): IDR {
        this.amount += Math.floor(value);
        return this;
    }

    subtract(value: number): IDR {
        this.amount -= Math.floor(value);
        return this;
    }

    // Add percentage margin safely
    addMarginPercent(percent: number): IDR {
        const margin = Math.floor(this.amount * (percent / 100));
        this.amount += margin;
        return this;
    }

    // Add fixed margin
    addMarginFixed(value: number): IDR {
        this.amount += Math.floor(value);
        return this;
    }

    // Get final value (never negative)
    value(): number {
        return Math.max(0, this.amount);
    }

    // Format as IDR currency
    format(): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(this.value());
    }
}

// Example usage:
// const price = new IDR(10000).addMarginPercent(10).addMarginFixed(500).value();
// Result: 11500 (10000 + 1000 + 500)
