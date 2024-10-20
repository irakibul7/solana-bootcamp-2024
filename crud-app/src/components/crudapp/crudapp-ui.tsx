'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { useCrudappProgram, useCrudappProgramAccount } from './crudapp-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

export function CrudappCreate() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const {createEntry} = useCrudappProgram();
  const {publicKey} = useWallet();

  const isFormValid = title.trim() !== '' && message.trim() !== '';

  const handleSubmit = () => {
    if(publicKey && isFormValid) {
      createEntry.mutateAsync({title, message, owner: publicKey});
    }
  };


  if(!publicKey) {
    return <p>Connect your wallet</p>
  }

  return (
    <div>
      <input type='text' placeholder='Title' value={title} onChange={(e) => setTitle(e.target.value)}
      className='input input-bordered w-full max-w-xs'/>
      <textarea placeholder='Message' value={message} onChange={(e) => setMessage(e.target.value)} className='textarea textarea-bordered w-full max-w-xs'/>
        <button onClick={handleSubmit} disabled={createEntry.isPending || !isFormValid} className='btn btn-xs lg:btn-md btn-primary'/>
    </div>
  )
}

export function CrudappList() {
  const { accounts, getProgramAccount } = useCrudappProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CrudappCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CrudappCard({ account }: { account: PublicKey }) {
  const {accountQuery, updateEntry, deleteEntry} = useCrudappProgramAccount({account});

  const {publicKey} = useWallet();

  const [message, setMessage ] = useState("");
  const title = accountQuery.data?.title;
  const isFormValid = message.trim() !== "";

  const handleUpdate = () => {
    if(publicKey && isFormValid && title) {
      updateEntry.mutateAsync({title, message, owner: publicKey});
    }
  };

  const handleDelete  = () => {}


  if(!publicKey) {
    return <p>Connect your wallet</p>
  }

  return accountQuery.isLoading ? (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  ) : (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{accountQuery.data?.message}</p>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Update Message</span>
          </label>
          <textarea 
            className="textarea textarea-bordered h-24" 
            placeholder="New message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>
        <div className="card-actions justify-end">
          <button 
            className="btn btn-primary" 
            onClick={handleUpdate}
            disabled={updateEntry.isPending || !isFormValid}
          >
            Update
          </button>
          <button 
            className="btn btn-error" 
            onClick={() => {
              const title = accountQuery.data?.title;
              if(title){
                return deleteEntry.mutateAsync(title)
              }
            }}
            disabled={deleteEntry.isPending}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
