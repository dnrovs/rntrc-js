import Rntrc from '../src'

describe('Rntrc', () => {
    describe('constructor', () => {
        it('should successfully create a valid RNTRC instance', () => {
            const validRntrc = Rntrc.generate().toString()
            const rntrcInstance = new Rntrc(validRntrc)
            expect(rntrcInstance.toString()).toBe(validRntrc)
        })

        it('should throw an error for an invalid RNTRC when ignoreInvalid is false', () => {
            expect(() => new Rntrc('1234567890', false)).toThrow(
                'Invalid RNTRC'
            )
        })

        it('should throw an error if RNTRC number length is not 10', () => {
            expect(() => new Rntrc('123456789')).toThrow('Invalid RNTRC')
        })

        it('should create an instance even with an invalid RNTRC if ignoreInvalid is true', () => {
            const rntrcInstance = new Rntrc('1234567890', true)
            expect(rntrcInstance.toString()).toBe('1234567890')
        })
    })

    describe('birthdate', () => {
        it('should return the correct birthdate based on the RNTRC', () => {
            const rntrcInstance = Rntrc.generate({
                day: 1,
                month: 1,
                year: 2000
            })
            expect(rntrcInstance.birthdate().toISOString()).toBe(
                '2000-01-01T00:00:00.000Z'
            )
        })
    })

    describe('age', () => {
        const mockNow = new Date('2025-07-31T00:00:00.000Z')

        beforeAll(() => {
            jest.useFakeTimers().setSystemTime(mockNow)
        })

        afterAll(() => {
            jest.useRealTimers()
        })

        it('should return the correct age based on the RNTRC', () => {
            const rntrcInstance = Rntrc.generate({
                day: 24,
                month: 8,
                year: 1991
            })
            expect(rntrcInstance.age()).toStrictEqual({
                years: 33,
                months: 11,
                days: 7
            })
        })
    })

    describe('gender', () => {
        it("should return 'male' for male RNTRC", () => {
            const rntrcInstance = Rntrc.generate({ gender: 'male' })
            expect(rntrcInstance.gender()).toBe('male')
        })

        it("should return 'female' for female RNTRC", () => {
            const rntrcInstance = Rntrc.generate({ gender: 'female' })
            expect(rntrcInstance.gender()).toBe('female')
        })
    })

    describe('male', () => {
        it('should return true for male RNTRC', () => {
            const rntrcInstance = Rntrc.generate({ gender: 'male' })
            expect(rntrcInstance.male()).toBe(true)
        })

        it('should return false for female RNTRC', () => {
            const rntrcInstance = Rntrc.generate({ gender: 'female' })
            expect(rntrcInstance.male()).toBe(false)
        })
    })

    describe('female', () => {
        it('should return true for female RNTRC', () => {
            const rntrcInstance = Rntrc.generate({ gender: 'female' })
            expect(rntrcInstance.female()).toBe(true)
        })

        it('should return false for male RNTRC', () => {
            const rntrcInstance = Rntrc.generate({ gender: 'male' })
            expect(rntrcInstance.female()).toBe(false)
        })
    })

    describe('accountingCardNumber', () => {
        it('should return the correct accounting card number', () => {
            const rntrcInstance = Rntrc.generate()
            expect(rntrcInstance.accountingCardNumber()).toBe(
                rntrcInstance.toString().slice(5, 9)
            )
        })
    })

    describe('valid', () => {
        it('should return true for a valid RNTRC', () => {
            const rntrcInstance = Rntrc.generate()
            expect(rntrcInstance.valid()).toBe(true)
        })

        it('should return false for an invalid RNTRC', () => {
            const rntrcInstance = new Rntrc('1234567890', true)
            expect(rntrcInstance.valid()).toBe(false)
        })
    })

    describe('generate', () => {
        it('should generate a valid RNTRC instance', () => {
            const rntrcInstance = Rntrc.generate()
            expect(rntrcInstance.valid()).toBe(true)
        })

        it('should generate an RNTRC with the specified birthdate', () => {
            const rntrcInstance = Rntrc.generate({
                day: 15,
                month: 6,
                year: 1985
            })
            const birthdate = rntrcInstance.birthdate()
            expect(birthdate.toISOString()).toBe('1985-06-15T00:00:00.000Z')
        })

        it('should generate an RNTRC with the specified gender', () => {
            const rntrcMale = Rntrc.generate({ gender: 'male' })
            const rntrcFemale = Rntrc.generate({ gender: 'female' })
            expect(rntrcMale.gender()).toBe('male')
            expect(rntrcFemale.gender()).toBe('female')
        })
    })
})
