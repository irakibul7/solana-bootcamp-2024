import * as anchor from '@coral-xyz/anchor'
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import { Voting } from "anchor/target/types/voting";

const IDL = require('../target/idl/voting.json');

const votingAddress = new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

describe('Voting', () => {
    let context;
    let provider;
    let votingProgram: Program<Voting>;

    beforeAll(async () => {
        context = await startAnchor("", [{name: "voting", programId: votingAddress}], []);
        provider = new BankrunProvider(context);
        votingProgram = new Program<Voting>(IDL, provider);
    })

    it('Initialize Poll', async () => {
        await votingProgram.methods.initializePoll(
            new anchor.BN(1),
            "what is your favorite type of peanut butter",
            new anchor.BN(0),
            new anchor.BN(1721246438),
        ).rpc();

        const [pollAddress] = PublicKey.findProgramAddressSync(
            [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
            votingAddress,
        )

        const poll = await votingProgram.account.poll.fetch(pollAddress);

        expect(poll.pollId.toNumber()).toEqual(1);
        expect(poll.description).toEqual('what is your favorite type of peanut butter');
        expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
    });

    it('initialize candidate', async () => {
        await votingProgram.methods.initializeCandidate(
            "Smooth",
            new BN(1)
        ).rpc();
        await votingProgram.methods.initializeCandidate(
            "Crunchy",
            new BN(1)
        ).rpc();

        const [crunchyAddress] = PublicKey.findProgramAddressSync([new BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Crunchy')], votingAddress);
        const [smoothAddress] = PublicKey.findProgramAddressSync([new BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Smooth')], votingAddress);

        const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);
        const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);

        // Use expect statements instead of console.log
        expect(crunchyCandidate.candidateName).toBe('Crunchy');
        expect(crunchyCandidate.candidateVotes.toNumber()).toBe(0);

        expect(smoothCandidate.candidateName).toBe('Smooth');
        expect(smoothCandidate.candidateVotes.toNumber()).toBe(0);
    });

    it('vote', async() => {
        await votingProgram.methods.vote(
            "Smooth",
            new BN(1)
        ).rpc();

        const [smoothAddress] = PublicKey.findProgramAddressSync([new BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Smooth')], votingAddress);

        const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);

        expect(smoothCandidate.candidateName).toBe('Smooth');
        expect(smoothCandidate.candidateVotes.toNumber()).toBe(1);
    });
})
