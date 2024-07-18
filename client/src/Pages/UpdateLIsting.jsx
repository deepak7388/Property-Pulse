import { useState,useEffect } from 'react';
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../../firebase';
import { useSelector } from 'react-redux';
import { useNavigate,useParams } from 'react-router-dom';



export default function UpdateListing() {

    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const params=useParams();
    

    const [files, setFiles] = useState([]);
    // console.log(files)
    const [formData, setFormData] = useState({
        imageUrls: [],
        name: '',
        description: '',
        address: '',
        type: 'rent',
        parking: false,
        furnished: false,
        wifi: false,
        cctv: false,
        geyser: false,
        privateBathroom: false,
        bedrooms: 1,
        regularPrice: 4000,
        discountPrice: 3500,
    });


    const [imageUploadError, setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchListing = async () => {
          const listingId = params.listingId;
          const res = await fetch(`/api/listing/get/${listingId}`);
          const data = await res.json();
          if (data.success === false) {
            console.log(data.message);
            return;
          }
          setFormData(data);
        };
    
        fetchListing();
      }, []);


    const handleImageSubmit = (e) => {
        if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
            setUploading(true);
            setImageUploadError(false);
            const promises = [];

            // upload images one by one into the DB
            for (let i = 0; i < files.length; i++) {
                promises.push(storeImage(files[i]));
            }

            Promise.all(promises)
                .then((urls) => {
                    setFormData({
                        ...formData,
                        imageUrls: formData.imageUrls.concat(urls),
                    });
                    setImageUploadError(false);
                    setUploading(false);
                })
                .catch((err) => {
                    setImageUploadError('Image upload failed (2 mb max per image)');
                    setUploading(false);
                });
        } else {
            setImageUploadError('You can only upload 6 images per listing');
            setUploading(false);
        }
    };


    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            // for every file create a unique name before storing it
            const fileName = new Date().getTime() + file.name;
            // store the file in firebase
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    // console.log(Upload is ${progress}% done);
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    };


    const handleRemoveImage = (index) => {
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter((_, i) => i !== index),
        });
    };


    const handleChange = (e) => {
        // tracking type of apartment sale or rent
        if (e.target.id === 'sale' || e.target.id === 'rent') {
            setFormData({
                ...formData,
                type: e.target.id,
            });
        }

        // handling checkboxe data
        if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'wifi' ||
            e.target.id === 'cctv' || e.target.id === 'geyser' || e.target.id === 'privateBathroom') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked,
            });
        }

        // handle everything else
        if (e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); //prevent refreshing the page
        try {
            if (formData.imageUrls.length < 1)
                return setError('You must upload at least one image');

            if (+formData.regularPrice < +formData.discountPrice)
                return setError('Discount price must be lower than regular price');

            setLoading(true);
            setError(false);

            const res = await fetch(`/api/listing/update/${params.listingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id,
                }),
            });

            const data = await res.json();
            setLoading(false);

            if (data.success === false) {
                setError(data.message);
            }

            navigate(`/listing/${data._id}`);

        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };



    return (
        <main className=' max-w-4xl bg-zinc-800  text-gray-200 mx-auto md:border md:border-gray-400 md:rounded-lg my-10 p-4 '>
            <h1 className='text-4xl  font-bold  text-center my-7'>
                Update a Listing
            </h1>
            <form onSubmit={handleSubmit} className=' flex flex-col sm:flex-row gap-4'>
                <div className='flex flex-col gap-4 flex-1'>
                    <input type='text' placeholder='Title' className='text-black border p-3 rounded-lg' id='name' maxLength='62' minLength='5' required onChange={handleChange} value={formData.name} />
                    <textarea type='text' placeholder='Description' className='text-black border p-3 rounded-lg' id='description' required onChange={handleChange} value={formData.description} />
                    <input type='text' placeholder='Address' className='border p-3 rounded-lg text-black' id='address' required onChange={handleChange} value={formData.address} />


                    <div className='flex gap-6 flex-wrap'>
                        <div className='flex gap-2'>
                            <input type='checkbox' id='sale' className='w-5' onChange={handleChange} checked={formData.type === 'sale'} />
                            <span>Sell</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox' id='rent' className='w-5' onChange={handleChange} checked={formData.type === 'rent'} />
                            <span>Rent</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox' id='parking' className='w-5' onChange={handleChange} checked={formData.parking} />
                            <span>Parking spot</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox' id='furnished' className='w-5' onChange={handleChange} checked={formData.furnished} />
                            <span>Furnished</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox' id='wifi' className='w-5' onChange={handleChange} checked={formData.wifi} />
                            <span>Wifi</span>
                        </div>
                        <div className='flex gap-2'>
                            <input type='checkbox' id='cctv' className='w-5' onChange={handleChange} checked={formData.cctv} />
                            <span>CCTV </span>
                        </div>
    
                        <div className='flex gap-2'>
                            <input type='checkbox' id='privateBathroom' className='w-5' onChange={handleChange} checked={formData.privateBathroom} />
                            <span>Private Bathroom </span>
                        </div>
                    </div>


                    <div className='flex flex-wrap gap-6 '>
                        <div className='flex items-center gap-2'>
                            <input type='number' id='bedrooms' min='1' max='15' required onChange={handleChange} value={formData.bedrooms} className='p-3 border text-black border-gray-300 rounded-lg' />
                            <p>Beds</p>
                        </div>

                        <div className='flex items-center gap-2'>
                            <input type='number' id='regularPrice' required onChange={handleChange} value={formData.regularPrice} className='p-3 border text-black border-gray-300 rounded-lg' />
                            <div className='flex flex-col items-center'>
                                <p>Regular price</p>
                                <span className='text-xs'>(Rs. / month)</span>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <input type='number' id='discountPrice' required onChange={handleChange} value={formData.discountPrice} className='p-3 border text-black border-gray-300 rounded-lg' />
                            <div className='flex flex-col items-center'>
                                <p>Discounted price</p>
                                <span className='text-xs'>(Rs. / month)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col flex-1 gap-4'>
                    <p className='font-semibold text-red-500'>Images:
                        <span className='font-normal text-gray-300 ml-2'>
                            The first image will be the cover <span className='text-red-400 '>(max 6)</span>
                        </span>
                    </p>

                    <div className='flex gap-4'>
                        <input onChange={(e) => setFiles(e.target.files)} className='p-3 border border-gray-300 rounded w-full' type='file' id='images' accept='image/*' multiple />
                        <button type='button' disabled={uploading} onClick={handleImageSubmit} className='p-3 text-violet-400 border border-violet-400 rounded uppercase hover:bg-violet-900  disabled:opacity-80'>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>

                    <p className='text-red-700 text-sm'>
                        {imageUploadError && imageUploadError}
                    </p>

                    {formData.imageUrls.length > 0 &&
                        formData.imageUrls.map((url, index) => (

                            <div key={url} className='flex justify-between p-3 border items-center'>
                                <img src={url} alt='listing image' className='w-20 h-20 object-contain rounded-lg' />
                                <button type='button' onClick={() => handleRemoveImage(index)} className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'>
                                    Delete
                                </button>
                            </div>
                        ))}
                    <button disabled={loading || uploading} className='p-3 bg-green-700 text-white rounded-lg uppercase hover:opacity-85 disabled:opacity-75'>
                        {loading ? 'Updating...' : "Update Listing"}
                    </button>
                    {error && <p className='text-red-700 text-sm'>{error}</p>}
                </div>
            </form>
        </main>
    );
}