import React from 'react'

function RegisterPage() {
    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("register complete");
    }

    const SpecializationFields = [
        "Allergy and Immunology",
        "Anesthesiology",
        "Cardiology",
        "Cardiothoracic Surgery",
        "Cardiovascular Surgery",
        "Clinical Genetics",
        "Clinical Immunology",
        "Clinical Neurophysiology",
        "Colorectal Surgery",
        "Critical Care Medicine",
        "Dentistry",
        "Dermatology",
        "Dermatopathology",
        "Developmental Pediatrics",
        "Diabetology",
        "Emergency Medicine",
        "Endocrinology",
        "Endocrine Surgery",
        "Family Medicine",
        "Forensic Medicine",
        "Forensic Pathology",
        "Gastroenterology",
        "General Medicine",
        "General Practice",
        "General Surgery",
        "Geriatric Medicine",
        "Geriatrics",
        "Gynecologic Oncology",
        "Gynecology",
        "Hematology",
        "Hematology and Oncology",
        "Hepatology",
        "Hospital Medicine",
        "Hyperbaric Medicine",
        "Immunology",
        "Infectious Disease",
        "Internal Medicine",
        "Interventional Cardiology",
        "Interventional Pain Medicine",
        "Interventional Radiology",
        "Maternal-Fetal Medicine",
        "Medical Genetics",
        "Medical Oncology",
        "Neonatology",
        "Nephrology",
        "Neurocritical Care",
        "Neurology",
        "Neuromuscular Medicine",
        "Neuroradiology",
        "Neurosurgery",
        "Nuclear Medicine",
        "Nutrition Medicine",
        "Obesity Medicine",
        "Obstetrics",
        "Obstetrics and Gynecology",
        "Occupational Medicine",
        "Ophthalmology",
        "Optometry",
        "Oral and Maxillofacial Surgery",
        "Orthodontics",
        "Orthopedic Oncology",
        "Orthopedic Surgery",
        "Orthopedics",
        "Otolaryngology",
        "Pain Management",
        "Palliative Care",
        "Pathology",
        "Pediatric Cardiology",
        "Pediatric Critical Care",
        "Pediatric Dentistry",
        "Pediatric Dermatology",
        "Pediatric Endocrinology",
        "Pediatric Gastroenterology",
        "Pediatric Hematology",
        "Pediatric Infectious Disease",
        "Pediatric Intensive Care",
        "Pediatric Nephrology",
        "Pediatric Neurology",
        "Pediatric Neurosurgery",
        "Pediatric Oncology",
        "Pediatric Ophthalmology",
        "Pediatric Orthopedics",
        "Pediatric Otolaryngology",
        "Pediatric Pulmonology",
        "Pediatric Radiology",
        "Pediatric Rheumatology",
        "Pediatric Surgery",
        "Pediatric Urology",
        "Pediatrics",
        "Periodontics",
        "Physical Medicine and Rehabilitation",
        "Plastic Surgery",
        "Preventive Medicine",
        "Primary Care",
        "Proctology",
        "Psychiatry",
        "Child and Adolescent Psychiatry",
        "Addiction Psychiatry",
        "Geriatric Psychiatry",
        "Forensic Psychiatry",
        "Psychosomatic Medicine",
        "Public Health",
        "Pulmonary Medicine",
        "Pulmonology",
        "Radiation Oncology",
        "Radiology",
        "Reconstructive Surgery",
        "Reproductive Endocrinology",
        "Reproductive Medicine",
        "Respiratory Medicine",
        "Rheumatology",
        "Sleep Medicine",
        "Sports Medicine",
        "Surgical Oncology",
        "Thoracic Surgery",
        "Transplant Surgery",
        "Trauma Surgery",
        "Tropical Medicine",
        "Urogynecology",
        "Urology",
        "Vascular Surgery",
        "Venereology",
        "Aviation Medicine",
        "Aerospace Medicine",
        "Lifestyle Medicine",
        "Integrative Medicine",
        "Regenerative Medicine",
        "Sexual Medicine",
        "Clinical Pharmacology",
        "Pharmacology",
        "Medical Microbiology",
        "Virology",
        "Bacteriology",
        "Parasitology",
        "Clinical Pathology",
        "Anatomical Pathology",
        "Cytopathology",
        "Molecular Pathology",
        "Genomic Medicine",
        "Rehabilitation Medicine",
        "Sports and Exercise Medicine",
        "Cosmetic Surgery",
        "Cosmetic Dermatology",
        "Hair Transplant Surgery",
        "Trichology",
        "Andrology",
        "Breast Surgery",
        "Hand Surgery",
        "Spine Surgery",
        "Foot and Ankle Surgery",
        "Hip and Knee Surgery",
        "Shoulder and Elbow Surgery",
        "Pediatric Endocrinology",
        "Pediatric Allergy and Immunology",
        "Pediatric Emergency Medicine",
        "Pediatric Rehabilitation Medicine",
        "Medical Toxicology",
        "Clinical Toxicology",
        "Transfusion Medicine",
        "Blood Banking",
        "Hospice and Palliative Medicine",
        "Community Medicine",
        "Rural Medicine",
        "Travel Medicine",
        "Marine Medicine",
        "Telemedicine",
        "Clinical Nutrition",
        "Rehabilitation Psychiatry",
        "Pain Medicine",
        "Female Pelvic Medicine and Reconstructive Surgery",
        "Reconstructive Urology",
        "Vascular and Interventional Radiology",
        "Neurointerventional Surgery",
        "Electrophysiology",
        "Heart Failure Medicine",
        "Structural Heart Disease",
        "Adult Congenital Heart Disease",
        "Lipidology",
        "Bone Marrow Transplantation",
        "Stem Cell Therapy",
        "Clinical Informatics",
        "Medical Administration",
        "Health Informatics"
    ]
    
  return (
    <div className='register-container'>
        <div className="register-card">
            <div className="header-text">
                <h1>Welcome to Clinora</h1>
                <p>Register to continue</p>
            </div>
            <form action={handleSubmit} className="form">
                <div className="form-group">
                    <label>Name:</label>
                    <input type="text" placeholder='Enter your name' required />
                </div>
                <div className="form-group">
                    <label>specialization:</label>
                    <select name="specialization" id="specialization">

                        <option value="select specialization">Select Specialization</option>

                        {SpecializationFields.map((specialization) => (
                            <option key={specialization} value={specialization}>
                                {specialization}
                            </option>
                        )
                    )}
                    </select>
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" placeholder='example@gmail.com' required />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input type="password" placeholder='Enter your password' required />
                </div>
            </form>
        </div>
    </div>
  )
}

export default RegisterPage