/**
 * The type for gender values in RNTRC.
 */
export type Gender = 'male' | 'female'

/**
 * The type for age values in RNTRC.
 * */
export type Age = {
    /** Years that have passed since a person's birth */
    years: number
    /** Months that have passed since a person's birth */
    months: number
    /** Days that have passed since a person's birth */
    days: number
}

/**
 * Parameters for generating a RNTRC number.
 */
export interface GenerateParams {
    /** @param {string | number} [day] - Day of birth */
    day?: string | number
    /** @param {string | number} [month] - Month of birth */
    month?: string | number
    /** @param {string | number} [year] - Year of birth */
    year?: string | number
    /** @param {Gender} [gender] - Gender of the person */
    gender?: Gender
}

/**
 * Represents an RNTRC (Ukrainian personal tax identifier with embedded information about birthdate and gender).
 *
 * @see {@link https://uk.wikipedia.org/wiki/Реєстраційний_номер_облікової_картки_платника_податків|RNTRC on Ukrainian Wikipedia}
 * @see {@link https://zakon.rada.gov.ua/laws/show/z1306-17#n230|RNTRC number structure}
 */
export default class Rntrc {
    private static readonly WEIGHTS: number[] = [-1, 5, 7, 9, 4, 6, 10, 5, 7]
    private static readonly BASE_DATE_MS: number = Date.UTC(1899, 11, 31)
    private static readonly MIN_DATE: Date = new Date(Date.UTC(1900, 0, 1))
    private static readonly MAX_DATE: Date = new Date(Date.UTC(2173, 9, 14))
    private static readonly MILLIS_PER_DAY: number = 86400000

    private readonly value: string
    private readonly ignoreInvalid: boolean

    /**
     * Creates a new RNTRC instance
     *
     * @param {string | number} rntrc - The RNTRC number
     * @param {boolean} [ignoreInvalid = false] - Whether to skip validation of the RNTRC number
     *
     * @throws {Error} If the RNTRC is invalid and ignoreInvalid is false, or RNTRC isn't 10 digits.
     *
     * @see {@link https://uk.wikipedia.org/wiki/Реєстраційний_номер_облікової_картки_платника_податків|RNTRC on Ukrainian Wikipedia}
     * @see {@link https://zakon.rada.gov.ua/laws/show/z1306-17#n230|RNTRC number structure}
     */
    constructor(rntrc: string | number, ignoreInvalid?: boolean) {
        this.value = String(rntrc)
        this.ignoreInvalid = ignoreInvalid ?? false

        if (
            (!this.ignoreInvalid && !this.valid()) ||
            this.value.length !== 10 ||
            !/^\d{10}$/.test(this.value)
        ) {
            throw new Error('Invalid RNTRC')
        }
    }

    /**
     * Gets the RNTRC number string.
     *
     * @returns {string} RNTRC number string
     * */
    public toString(): string {
        return this.value
    }

    [Symbol.for('nodejs.util.inspect.custom')](): string {
        return this.toString()
    }

    /**
     * Defines how the object should be converted to a primitive value
     * Called automatically during type coercion operations like string
     * concatenation, mathematical operations, and equality comparisons
     *
     * @returns {string} The primitive string representation of the TIN
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive}
     */
    [Symbol.toPrimitive](): string {
        return this.toString()
    }

    /**
     * Gets the birthdate encoded in the RNTRC
     *
     * @returns {Date} The birthdate
     */
    public birthdate(): Date {
        const days = parseInt(this.value.slice(0, 5), 10)
        return new Date(Rntrc.BASE_DATE_MS + days * Rntrc.MILLIS_PER_DAY)
    }

    public age(): Age {
        const birthdate = this.birthdate()
        const now = new Date()

        let years = now.getFullYear() - birthdate.getFullYear()
        let months = now.getMonth() - birthdate.getMonth()
        let days = now.getDate() - birthdate.getDate()

        if (days < 0) {
            months -= 1
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
            days += prevMonth.getDate()
        }

        if (months < 0) {
            years -= 1
            months += 12
        }

        return { years, months, days }
    }

    /**
     * Gets the gender encoded in the RNTRC
     *
     * @returns {Gender} The gender ('male' or 'female')
     */
    public gender(): Gender {
        return Number(this.value[8]) % 2 !== 0 ? 'male' : 'female'
    }

    /**
     * Checks if the RNTRC belongs to a male person
     *
     * @returns {boolean} True if male, false otherwise
     */
    public male(): boolean {
        return this.gender() === 'male'
    }

    /**
     * Checks if the RNTRC belongs to a female person
     *
     * @returns {boolean} True if female, false otherwise
     */
    public female(): boolean {
        return this.gender() === 'female'
    }

    /**
     * Gets sequential number of the Облікова картка № 1ДР
     *
     * @returns {string} The sequential number from RNTRC
     */
    public accountingCardNumber(): string {
        return this.value.slice(5, 9)
    }

    private static checksum(rntrc: string | number): string {
        const digits = String(rntrc)
            .split('')
            .map((d) => parseInt(d, 10))

        const len = Math.min(digits.length, Rntrc.WEIGHTS.length)

        let sum = 0
        for (let i = 0; i < len; i++) {
            sum += digits[i] * Rntrc.WEIGHTS[i]
        }

        let checksum = (sum % 11) % 10
        if (checksum === 10) checksum = 0

        return checksum.toString()
    }

    /**
     * Validates the RNTRC number
     *
     * @returns {boolean} True if the RNTRC is valid, false otherwise
     */
    public valid(): boolean {
        if (this.value[8] === '0') return false
        return this.value[9] === Rntrc.checksum(this.value)
    }

    /**
     * Generate a random RNTRC instance.
     *
     * Generates a valid RNTRC based on the provided parameters. If parameters are not provided,
     * random valid values will be used. The generated RNTRC will include a birthdate between
     * 1900-01-01 and 2173-10-14, a random record number and a gender digit based on the
     * specified or random gender.
     *
     * @param {GenerateParams} params - Configuration object for RNTRC generation
     * @param {string | number} [params.day] - Day of birth
     * @param {string | number} [params.month] - Month of birth
     * @param {string | number} [params.year] - Year of birth
     * @param {Gender} [params.gender] - Gender of the person
     *
     * @returns {Rntrc} A new valid RNTRC instance
     *
     * @throws {Error} If date is invalid or outside allowed range
     * @throws {Error} If gender value is invalid
     */
    static generate({ day, month, year, gender }: GenerateParams = {}): Rntrc {
        const today = new Date()

        const random = (min: number, max: number): number => {
            return Math.floor(Math.random() * (max - min + 1)) + min
        }

        year = isNaN(Number(year))
            ? random(1900, today.getFullYear())
            : Number(year)

        const maxMonth =
            year === today.getFullYear()
                ? today.getMonth() + 1
                : new Date(year, 11, 31).getMonth() + 1

        month = isNaN(Number(month)) ? random(1, maxMonth) : Number(month)

        const maxDay =
            year === today.getFullYear() && month === today.getMonth() + 1
                ? today.getDate()
                : new Date(year, month, 0).getDate()

        day = isNaN(Number(day)) ? random(1, maxDay) : Number(day)

        const testDate = new Date(Date.UTC(year, month - 1, day))
        if (
            testDate.getDate() !== day ||
            testDate.getMonth() !== month - 1 ||
            testDate.getFullYear() !== year
        ) {
            throw new Error(`Invalid date: ${year}-${month}-${day}`)
        }

        const birthdate = new Date(Date.UTC(year, month - 1, day)).getTime()

        if (
            birthdate < Rntrc.MIN_DATE.getTime() ||
            birthdate > Rntrc.MAX_DATE.getTime()
        )
            throw new Error(
                `Birthdate must be between ${Rntrc.MIN_DATE.toLocaleDateString()} and ${Rntrc.MAX_DATE.toLocaleDateString()}`
            )

        const days = String(
            Math.floor((birthdate - Rntrc.BASE_DATE_MS) / Rntrc.MILLIS_PER_DAY)
        ).padStart(5, '0')

        const recordNumeric = String(random(0, 999)).padStart(3, '0')

        let genderNumeric: number

        if (!gender) {
            genderNumeric = random(1, 8)
        } else if (gender === 'female') {
            genderNumeric = random(0, 3) * 2 + 2
        } else if (gender === 'male') {
            genderNumeric = random(0, 4) * 2 + 1
        } else {
            throw new Error('Gender must be either "male" or "female"')
        }

        const rntrc = days + recordNumeric + genderNumeric

        return new Rntrc(rntrc + Rntrc.checksum(rntrc))
    }
}
