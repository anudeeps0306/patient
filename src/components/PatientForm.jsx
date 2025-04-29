import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDb } from '../services/db';

export default function PatientForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    medicalHistory: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const db = await getDb();
      await db.query(
        `INSERT INTO patients 
         (first_name, last_name, date_of_birth, gender, email, phone, address, medical_history)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          formData.firstName,
          formData.lastName,
          formData.dateOfBirth,
          formData.gender,
          formData.email,
          formData.phone,
          formData.address,
          formData.medicalHistory
        ]
      );
      
      alert('Patient registered successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error registering patient:', error);
      alert('Failed to register patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Register New Patient</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="form-label">First Name*</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="form-label">Last Name*</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="dateOfBirth" className="form-label">Date of Birth*</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          
          <div>
            <label htmlFor="gender" className="form-label">Gender*</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="form-label">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="address" className="form-label">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="input"
          />
        </div>
        
        <div>
          <label htmlFor="medicalHistory" className="form-label">Medical History</label>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            rows={4}
            className="input"
          />
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
}