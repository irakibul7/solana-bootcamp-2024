import { ActionGetRequest, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Voting } from "../../../../anchor/target/types/voting";
import { BN, Program } from "@coral-xyz/anchor";
import * as anchor from '@coral-xyz/anchor';
const IDL = require('../../../../anchor/target/idl/voting.json');

export async function GET(req: Request){
    const payload: ActionGetRequest = {
        icon: 'https://blogstudio.s3.theshoppad.net/coffeeheroau/ec178d83e5f597b162cda1e60cb64194.jpg',
        title: 'Vote for your favorite type of peanut butter',
        description: 'Vote between crunchy and smooth peanut butter',
        label: 'Vote',
        links: {
            actions: [
                {

                    href: '/api/vote?candidate=Crunchy',
                    label: 'Vote for Crunchy'
                },
                {

                    href: '/api/vote?candidate=Smooth',
                    label: 'Vote for Smooth'
                },
            ]
        }
    }

    return (Response as any).json(payload, {headers: ACTIONS_CORS_HEADERS})
}

export const OPTIONS = GET;

export async function POST(request: Request){

    const connection = new anchor.web3.Connection("http://127.0.0.1:8899", "confirmed");
  const program: anchor.Program<Voting> = new anchor.Program(IDL as Voting, {connection});

  const url = new URL(request.url);
  const vote = url.searchParams.get('candidate') as string;

  if (vote !== 'Crunchy' && vote !== 'Smooth') {
    return Response.json({error: 'You voted for the wrong candidate'}, {status: 400, headers: ACTIONS_CORS_HEADERS});
  }

  const body: ActionPostRequest = await request.json();
  let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

  const instruction = await program.methods.vote(
    vote,
    new anchor.BN(1),
  ).accounts(
    { 
      signer: account,
    }
  ).instruction();
  const blockhashResponse = await connection.getLatestBlockhash();

  const tx = new Transaction({
    feePayer: account,
    blockhash: blockhashResponse.blockhash,
    lastValidBlockHeight: blockhashResponse.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: tx,
      type: "transaction"
    },
  });

  return Response.json(response,{headers: ACTIONS_CORS_HEADERS});

//     const url = new URL(req.url);
//     const candidate = url.searchParams.get('candidate');
//     if(candidate !== 'Crunchy' && candidate !== 'Smooth'){
//         return new Response("Invalid candidate", {status: 400, headers: ACTIONS_CORS_HEADERS})
//     }

//     const connection = new Connection("http://127.0.0.1:8899", 'confirmed');
//     const program: Program<Voting> = new Program(IDL, {connection})
//     const body:ActionPostRequest = await req.json();
//     let voter;
//     try {
//         voter = new PublicKey(body.account);

//     } catch (error) {
//     return new Response("Invalid Account", {status: 400, headers: ACTIONS_CORS_HEADERS})    
//     }

//    const instruction = await program.methods
//    .vote(candidate, new BN(1))
//    .accounts({
//     signer: voter
//    })
//    .instruction();

//    const blockhash = await connection.getLatestBlockhash();

//    const transaction = new Transaction({
//     feePayer: voter,
//     blockhash: blockhash.blockhash,
//     lastValidBlockHeight: blockhash.lastValidBlockHeight
//    }).add(instruction);
//    const response = await createPostResponse({
//     fields: {
//         transaction: transaction,
//         type: 'transaction'
//     }
//    });

//    return Response.json(response, {headers: ACTIONS_CORS_HEADERS})
}