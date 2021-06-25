import { GraphQLClient, gql } from 'graphql-request'
export const GetAxieDetail = gql`
    query GetAxieDetail($axieId: ID!) {
        axie(axieId: $axieId) {
            ...AxieDetail
            __typename
        }
    }

    fragment AxieDetail on Axie {
        id
        image
        class
        chain
        name
        genes
        owner
        birthDate
        bodyShape
        class
        sireId
        sireClass
        matronId
        matronClass
        stage
        title
        breedCount
        level
        figure {
            atlas
            model
            image
            __typename
        }
        parts {
            ...AxiePart
            __typename
        }
        stats {
            ...AxieStats
            __typename
        }
        auction {
            ...AxieAuction
            __typename
        }
        ownerProfile {
            name
            __typename
        }
        battleInfo {
            ...AxieBattleInfo
            __typename
        }
        children {
            id
            name
            class
            image
            title
            stage
            __typename
        }
        __typename
    }

    fragment AxieBattleInfo on AxieBattleInfo {
        banned
        banUntil
        level
        __typename
    }

    fragment AxiePart on AxiePart {
        id
        name
        class
        type
        specialGenes
        stage
        abilities {
            ...AxieCardAbility
            __typename
        }
        __typename
    }

    fragment AxieCardAbility on AxieCardAbility {
        id
        name
        attack
        defense
        energy
        description
        backgroundUrl
        effectIconUrl
        __typename
    }

    fragment AxieStats on AxieStats {
        hp
        speed
        skill
        morale
        __typename
    }

    fragment AxieAuction on Auction {
        startingPrice
        endingPrice
        startingTimestamp
        endingTimestamp
        duration
        timeLeft
        currentPrice
        currentPriceUSD
        suggestedPrice
        seller
        listingIndex
        state
        __typename
    }
`
