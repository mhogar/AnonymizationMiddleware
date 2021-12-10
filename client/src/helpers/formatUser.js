function resolvePostalCode(pc) {
    return `${pc.slice(0, 3)} ${pc.slice(-3)}`
}

function resolveMonth(month) {
    switch (month) {
        case '01':
            return 'January'
        case '02':
            return 'February'
        case '03':
            return 'March'
        case '04':
            return 'April'
        case '05':
            return 'May'
        case '06':
            return 'June'
        case '07':
            return 'July'
        case '08':
            return 'August'
        case '09':
            return 'September'
        case '10':
            return 'October'
        case '11':
            return 'November'
        case '12':
            return 'December'
    }
}

function resolveDate(date) {
    const tokens = date.split('-')
    return `${resolveMonth(tokens[1])} ${tokens[2]}, ${tokens[0]}`
}

function resolveGender(gender) {
    switch (gender) {
        case 'M':
            return 'Male'
        case 'F':
            return 'Female'
        case 'O':
            return 'Other'
    }
}

function resolvePhoneNumber(pn) {
    return `(${pn.slice(0, 3)}) ${pn.slice(3,6)}-${pn.slice(-4)}`
}

function resolveSIN(sin) {
    return `${sin.slice(0, 3)} ${sin.slice(3,6)} ${sin.slice(-3)}`
}

export default function(user) {
    let formattedUser = {}

    for (const [key, val] of Object.entries(user)) {
        if (val[0] === '*') {
            formattedUser[key] = {
                scrubbed: true,
                value: val.slice(1)
            }
        }
        else {
            formattedUser[key] = {
                scrubbed: false,
                value: val
            }
        }
    }

    formattedUser.PostalCode.value = resolvePostalCode(formattedUser.PostalCode.value)
    formattedUser.DateOfBirth.value = resolveDate(formattedUser.DateOfBirth.value)
    formattedUser.Gender.value = resolveGender(formattedUser.Gender.value)
    formattedUser.PhoneNumber.value = resolvePhoneNumber(formattedUser.PhoneNumber.value)
    formattedUser.SIN.value = resolveSIN(formattedUser.SIN.value)

    return formattedUser
}
