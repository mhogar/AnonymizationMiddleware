const reg = /%((?<type>[Ccds])(?<count>\d+)?(\[((?<min>\d+)-(?<max>\d+))?(?<string>[a-zA-Z,]+)?\])?)+/

function valueOrDefault(val, d) {
    return val != null ? val : d
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function genStringWithFormat(format) {
    let match = null
    while ((match = reg.exec(format)) !== null) {
        let s = ""

        const count = parseInt(valueOrDefault(match.groups['count'], '1'))
        for (let i = 0; i < count; i++) {
            switch (match.groups['type']) {
                case 'C':
                    s += String.fromCharCode(randInt(0x41, 0x5a))
                    break
                case 'c':
                    s += String.fromCharCode(randInt(0x61, 0x7a))
                    break
                case 'd':
                    const min = parseInt(valueOrDefault(match.groups['min'], '0'))
                    const maxStr = valueOrDefault(match.groups['max'], '9')
                    const max = parseInt(maxStr)

                    s += ('0'.repeat(maxStr.length) + randInt(min, max)).slice(-maxStr.length)
                    break
                case 's':
                    const tokens = match.groups['string'].split(',')
                    s += tokens[randInt(0, tokens.length)]
                    break
            }
        }

        format = format.replace(match[0], s)
    }

    return format
}

const privacyLogic = {
    scrubString(privacyLevel, str, minPrivacyLevel, format) {
        return privacyLevel < minPrivacyLevel ? '*' + genStringWithFormat(format) : str
    }
}

module.exports = {
    privacyLogic: privacyLogic
}
