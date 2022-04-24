export declare interface Unit{
    convert: (value: number, units: string) => number
}

export class Kilograms implements Unit{
    convert(value: number, units: string): number {
        switch (units){
            case "OUNCES":
                return value * 35.274
            case "POUNDS":
                return value * 2.20462
        }
        return value
    }
}

export class Ounces implements Unit{
    convert(value: number, units: string): number {
        return value * 0.0625
    }
}

export class Pounds implements Unit{
    convert(value: number, units: string): number {
        return value * 0.453592
    }
}