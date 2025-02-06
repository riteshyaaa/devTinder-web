import React from 'react'

const UserCard = ({user}) => {
     const {firstName, lastName, age, about,gender ,photoUrl} = user
    //  console.log(photoUrl)
  return (
    <div className="card bg-base-300 w-96 shadow-xl">
  <figure>
    <img
     src={photoUrl}
      alt="user photoUrl"/>
  </figure>
  <div className="card-body">
    <h2 className="card-title">{firstName + " " + lastName}!</h2>
   { age && gender && <p>{age +" ,"+ gender  } </p>}
    <p>{about}</p>
    <div className="card-actions justify-end m-10 ">
      <button className="px-4 py-2 text-white bg-blue-500 rounded transition duration-300 hover:bg-blue-600">Interested</button>
      <button className="px-4 py-2 text-white bg-pink-500 rounded transition duration-300 hover:bg-red-500">ignored</button>
    </div>
  </div>
</div>
  )
}

export default UserCard