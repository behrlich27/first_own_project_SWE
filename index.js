// BIG BROTHER SIMULATOR //

import { stdin as input, stdout as output } from 'node:process';
import readlinePromises from 'node:readline/promises';

let people = [];
let nominees = [];
let jury = [];
let outgoing_hoh = ""

const rl = readlinePromises.createInterface({ input, output });

async function numPeople() {

    let amount_people = 0
    while(amount_people % 2 === 0) {
        amount_people = await rl.question(`How many contestants are there (must be odd): `)
    }

    if (amount_people < 3) {
        console.log(`Amount of people cannot be below 3!`)
        return 0;
    }

    return amount_people;
}

function head_of_household(people, prev_hoh) {

    let new_hoh = prev_hoh

    while (new_hoh == prev_hoh) {

        new_hoh = people[Math.floor(Math.random() * people.length)]

    }

    console.log(`${new_hoh}, you are the new HEAD OF HOUSEHOLD`)
    return new_hoh

}

function final_3_hoh(people) {
    let new_hoh = people[Math.floor(Math.random() * people.length)]
    return new_hoh
}

function power_of_veto(people, nominees, hoh) {

    let nominees_len = nominees.length
    let pov_players = []

    pov_players.push(hoh)

    for (let i = 0; i < nominees_len; i++) {
        pov_players.push(nominees[i])
    }

    while (pov_players.length < Math.min(6, people.length)) {

        let new_player = hoh
        while (pov_players.includes(new_player)) {
            new_player = people[Math.floor(Math.random() * people.length)]
        }

        pov_players.push(new_player)
        

    }

    let pov_winner = pov_players[Math.floor(Math.random() * pov_players.length)]
    console.log(`${pov_winner}, you have won the POWER OF VETO`)
    return pov_winner

}

function blockbuster(nominees) {

    let blockbuster_winner = nominees[Math.floor(Math.random() * nominees.length)]
    console.log(`${blockbuster_winner}, you have won the BB BLOCKBUSTER`)
    return blockbuster_winner

}

async function voting(people, nominees, hoh) {

    let voters = []
    let nom1 = 0
    let nom2 = 0

    for (let i = 0; i < nominees.length; i++) {
        console.log(`${nominees[i]}, you are up for eviction`)
    }

    for (let i = 0; i < people.length; i++) {

        if (people[i] != hoh && !(nominees.includes(people[i]))) {
            voters.push(people[i])
        }

    }

    for (let i = 0; i < voters.length; i++) {

        let vote = ""

        while (!nominees.includes(vote)) {
            vote = await rl.question(`${voters[i]} who do you want to evict: `)
        }

        if (vote == nominees[0]) {
            nom1++
        }
        else if (vote == nominees[1]) {
            nom2++
        }
    }

    let eliminated

    if (nom1 > nom2) {
        eliminated = nominees[0]
    }
    else if (nom2 > nom1) {
        eliminated = nominees[1]
    }
    else {
        let hohVote = await rl.question(
            `${hoh}, the vote is tied. Who do you want to evict? `
        )

        if (hohVote == nominees[0]) {
            eliminated = nominees[0]
        }
        else {
            eliminated = nominees[1]
        }
    }

    if (nom2>nom1) {
        [nom1, nom2] = [nom2, nom1]
    }

    console.log(`By a vote of ${nom1} to ${nom2}, ${eliminated} has been evicted from the Big Brother House!`)

    return eliminated
}

async function winner(people, jury) {

    let finalist1 = 0
    let finalist2 = 0

    for (let i = 0; i < jury.length; i++) {

        let vote = ""
        while (vote != people[0] && vote != people[1]) {
            vote = await rl.question(
                `${jury[i]} who do you think should win this season of Big Brother: `
            )
        }

        if (vote == people[0]) {
            finalist1++
        }
        else if (vote == people[1]) {
            finalist2++
        }
    }

    let winner

    if (finalist1 > finalist2) {
        winner = people[0]
    }
    else if (finalist2 > finalist1) {
        winner = people[1]
    }

    if (finalist2>finalist1) {
        [finalist1, finalist2] = [finalist2, finalist1]
    }

    console.log(`By a vote of ${finalist1} to ${finalist2}, the winner of Big Brother is... ${winner}`)
    return winner
}

function remove_person(people, person) {

    for (let i = 0; i < people.length; i++) {

        if (people[i] == person) {
            people.splice(i, 1)
            break
        }

    }

}


async function askQuestion() {
    
    const n = await numPeople();
    for (let i = 0; i < n; i++) {
        let name = await rl.question('Enter a contestant: ')
        people.push(name)
    };

    while (people.length>6) {

        let hoh = head_of_household(people, outgoing_hoh)
        let nom1 = ""
        while (!people.includes(nom1) || nom1 == hoh) {
            nom1 = await rl.question('Who is your first nominee: ')
        }
        nominees.push(nom1)
        let nom2 = ""
        while (!people.includes(nom2) || nom2 == hoh || nominees.includes(nom2)) {
            nom2 = await rl.question('Who is your second nominee: ')
        }
        nominees.push(nom2)
        let nom3 = ""
        while (!people.includes(nom3) || nom3 == hoh || nominees.includes(nom3)) {
            nom3 = await rl.question('Who is your third nominee: ')
        }
        nominees.push(nom3)
        
        let pov_winner = power_of_veto(people, nominees, hoh)
        if (nominees.includes(pov_winner)) {
            remove_person(nominees, pov_winner)

            let renom = ""
            while (!people.includes(renom) || nominees.includes(renom) || renom == pov_winner) {
                renom = await rl.question(`${hoh}, who is your new nominee: `)
            }

            console.log(`${renom}, you have been nominated for eviction`)
            nominees.push(renom)
        } else {
            let use_veto = await rl.question('Do you want to use the veto (Y/N): ')
            if (use_veto == "Y") {
                let saved = ""
                while (!(nominees.includes(saved))) {
                    saved = await rl.question('Who are you using the veto on: ')
                }
                console.log(`${saved}, ${pov_winner} has taken you off the eviction block`)
                remove_person(nominees, saved)
                let renom = ""
                while (!people.includes(renom) || nominees.includes(renom) || renom == pov_winner) {
                    renom = await rl.question(`${hoh}, who is your new nominee: `)
                }
                console.log(`${renom}, you have been nominated for eviction`)
                nominees.push(renom)
            }
        }
        let blockbuster_winner = blockbuster(nominees)
        remove_person(nominees, blockbuster_winner)
        let voted_out = await voting(people, nominees, hoh)
        remove_person(people, voted_out)
        outgoing_hoh = hoh
        jury.push(voted_out)
        nominees = []

    }

    while (people.length>3 && people.length<7) {

        let hoh = head_of_household(people, outgoing_hoh)
        let nom1 = ""
        while (!people.includes(nom1) || nom1 == hoh) {
            nom1 = await rl.question('Who is your first nominee: ')
        }
        nominees.push(nom1)
        let nom2 = ""
        while (!people.includes(nom2) || nom2 == hoh || nominees.includes(nom2)) {
            nom2 = await rl.question('Who is your second nominee: ')
        }
        nominees.push(nom2)
        let pov_winner = power_of_veto(people, nominees, hoh)
        if (nominees.includes(pov_winner)) {
            remove_person(nominees, pov_winner)

            let renom = ""
            while (!people.includes(renom) || nominees.includes(renom) || renom == pov_winner) {
                renom = await rl.question(`${hoh}, who is your new nominee: `)
            }

            console.log(`${renom}, you have been nominated for eviction`)
            nominees.push(renom)
        } else {
            let use_veto = await rl.question('Do you want to use the veto (Y/N): ')
            if (use_veto == "Y") {
                let saved = ""
                while (!(nominees.includes(saved))) {
                    saved = await rl.question('Who are you using the veto on: ')
                }
                console.log(`${saved}, ${pov_winner} has taken you off the eviction block`)
                remove_person(nominees, saved)
                let renom = ""
                while (!people.includes(renom) || nominees.includes(renom) || renom == pov_winner) {
                    renom = await rl.question(`${hoh}, who is your new nominee: `)
                }
                console.log(`${renom}, you have been nominated for eviction`)
                nominees.push(renom)
            }
        }
        let voted_out = await voting(people, nominees, hoh)
        remove_person(people, voted_out)
        outgoing_hoh = hoh
        jury.push(voted_out)
        nominees = []

    }

    if (people.length == 3) {

        let hoh = final_3_hoh(people)
        console.log(`${new_hoh}, you are the new HEAD OF HOUSEHOLD`)
        let eliminated = ""
        while (!people.includes(eliminated) || eliminated == hoh) {
            eliminated = await rl.question(`${hoh}, who do you evict: `)
        }
        remove_person(people, eliminated)
        jury.push(eliminated)

    }

    if (people.length == 2) {

        let bb_winner = await winner(people, jury)

    }

    rl.close()

}

askQuestion()