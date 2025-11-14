import React from 'react'

export default function UploadDropzone({ onFile }:{ onFile:(f:File)=>void }){
  function handle(e:React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(f) onFile(f)
  }
  return (
    <label className="block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer">
      <input type="file" accept="application/pdf,image/*" className="hidden" onChange={handle} />
      <div>📄 Drag & Drop or Click to Upload</div>
    </label>
  )
}
