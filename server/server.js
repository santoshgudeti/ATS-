const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const bodyParser = require('body-parser');
const crypto = require('crypto'); // For hash calculation
const { Schema } = mongoose;
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
// Initialize Express app
const app = express();
const PORT = 5000;

// Create an HTTP server to support WebSockets
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection

mongoose
.connect(process.env.MONGO_URI,{})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));
// Schemas
const ApiResponseSchema = new Schema({
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
  jobDescriptionId: { type: Schema.Types.ObjectId, ref: 'JobDescription', required: true },
  matchingResult: Object,
  createdAt: { type: Date, default: Date.now },
  hash: { type: String, unique: true }, // Hash to avoid duplicate processing
});

const ResumeSchema = new Schema({
  title: String,
  pdf: Buffer,
  filename: String,
  uploadedAt: { type: Date, default: Date.now },
});

const JobDescriptionSchema = new Schema({
  title: String,
  description: Buffer,
  filename: String,
  uploadedAt: { type: Date, default: Date.now },
  hash: { type: String, unique: true }, // Hash for deduplication
});

const Resume = mongoose.model('Resume', ResumeSchema);
const JobDescription = mongoose.model('JobDescription', JobDescriptionSchema);
const ApiResponse = mongoose.model('ApiResponse', ApiResponseSchema);

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });
// User Schema and Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  });
  
  const User = mongoose.model("User", userSchema);
  
  // Authentication Routes
  app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: "User created successfully!" });
  } catch (err) {
  if (err.code === 11000) {
  res.status(400).json({ error: "Email already exists" });
  } else {
  res.status(500).json({ error: "Internal server error" });
  }
  }
  });
  
  app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  
  try {
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.status(200).json({ message: "Login successful", token });
  } catch (err) {
  res.status(500).json({ error: "Internal server error" });
  }
  });
  // Helper: Calculate SHA-256 hash
  const calculateHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
  };


// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('WebSocket client connected.');
  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected.');
  });
});

// Emit event on new ApiResponse creation
const emitApiResponseUpdate = (newResponse) => {
  io.emit('apiResponseUpdated', newResponse);
};

// Serve static files
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads/resumes')));
app.use('/uploads/job_descriptions', express.static(path.join(__dirname, 'uploads/job_descriptions')));

// POST Endpoint: Upload Resumes and Job Descriptions
app.post('/api/submit', upload.fields([{ name: 'resumes' }, { name: 'job_description' }]), async (req, res) => {
  let duplicateCount = 0; 
  try {
    const { files } = req;

    if (!files || !files.resumes || !files.job_description) {
      return res.status(400).json({ error: 'Resumes and job descriptions are required.' });
    }
    let duplicateCount = 0; // Initialize a counter for duplicates
    const results = [];

    for (const jobDescription of files.job_description) {
      const jdHash = calculateHash(jobDescription.buffer);

      let jobDescDoc = await JobDescription.findOne({ hash: jdHash });
      if (!jobDescDoc) {
        jobDescDoc = new JobDescription({
          title: jobDescription.originalname,
          description: jobDescription.buffer,
          filename: jobDescription.originalname,
          hash: jdHash,
        });
        await jobDescDoc.save();
      }

      for (const resume of files.resumes) {
        const resumeHash = calculateHash(resume.buffer);

        let resumeDoc = await Resume.findOne({ hash: resumeHash });
        if (!resumeDoc) {
          resumeDoc = new Resume({
            title: resume.originalname,
            pdf: resume.buffer,
            filename: resume.originalname,
            hash: resumeHash,
          });
          await resumeDoc.save();
        }

        const existingResponse = await ApiResponse.findOne({ hash: `${resumeHash}-${jdHash}` });
        if (existingResponse) {
          console.log(`Duplicate found for Resume: ${resume.originalname} and Job Description: ${jobDescription.originalname}. Skipping.`);
          duplicateCount++; // Increment duplicate counter
          continue;
        }

        const formData = new FormData();
        formData.append('resumes', resume.buffer, resume.originalname);
        formData.append('job_description', jobDescription.buffer, jobDescription.originalname);

        try {
          const apiResponse = await axios.post(
            'http://13.233.236.132:8001/candidates',
            formData,
            { headers: formData.getHeaders() }
          );

          if (apiResponse.data && apiResponse.data['POST Response']) {
            const savedResponse = new ApiResponse({
              resumeId: resumeDoc._id,
              jobDescriptionId: jobDescDoc._id,
              matchingResult: apiResponse.data['POST Response'],
              hash: `${resumeHash}-${jdHash}`,
            });
            await savedResponse.save();
            emitApiResponseUpdate(savedResponse);

            results.push({
              resume: resume.originalname,
              jobDescription: jobDescription.originalname,
              matchingResult: apiResponse.data['POST Response'],
            });
          }
        } catch (error) {
          console.error(`Error with external API for ${resume.originalname}:`, error.message);
        }
      }
    }

    console.log(`Total duplicates found: ${duplicateCount}`); // Log the total number of duplicates
    res.status(200).json({ message: 'Files processed and stored successfully.', results,duplicateCount});
  } catch (error) {
    console.error('Error processing files:', error.message);
    res.status(500).json({ error: 'Failed to process files.' });
  }
});

// GET Endpoints (Unchanged)
app.get('/api/candidate-filtering', async (req, res) => {
  try {
    const responses = await ApiResponse.find()
      .populate('resumeId', 'title filename')
      .populate('jobDescriptionId', 'title filename')
      .sort({ createdAt: -1 });
    res.status(200).json(responses);
  } catch (error) {
    console.error('Error fetching candidate filtering data:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidate filtering data.' });
  }
});

app.get('/api/resumes/:resumeId', async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ error: 'Resume not found.' });

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${resume.filename}"`,
    });
    res.end(resume.pdf);
  } catch (error) {
    console.error('Error retrieving resume:', error.message);
    res.status(500).json({ error: 'Failed to retrieve resume.' });
  }
});

app.get('/api/local-resumes', (req, res) => {
  try {
    const files = fs.readdirSync(path.join(__dirname, 'uploads/resumes'));
    res.status(200).json({ resumes: files.map((f) => ({ filename: f, path: `/uploads/resumes/${f}` })) });
  } catch (error) {
    console.error('Error fetching local resumes:', error.message);
    res.status(500).json({ error: 'Failed to fetch local resumes.' });
  }
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


/* 

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const bodyParser = require('body-parser');
const { Schema } = mongoose;
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs'); // File system module
const path = require('path'); // Path module
const PDFDocument = require('pdfkit');

// Initialize Express app
const app = express();
const PORT = 5000;

// Create an HTTP server to support WebSockets
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://ApplicationTrackingSystem:ApplicationTrackingSystem@skillmatrix.ntv9d.mongodb.net/?retryWrites=true&w=majority&appName=SkillMatrix')
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Define Mongoose Schemas
const ApiResponseSchema = new Schema({
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
  jobDescriptionId: { type: Schema.Types.ObjectId, ref: 'JobDescription', required: true },
  matchingResult: Object,
  createdAt: { type: Date, default: Date.now },
});

const ResumeSchema = new Schema({
  title: String,
  pdf: Buffer,
  filename: String,
  uploadedAt: { type: Date, default: Date.now },
});

const JobDescriptionSchema = new Schema({
  title: String,
  description: Buffer,
  filename: String,
  uploadedAt: { type: Date, default: Date.now },
});

const Resume = mongoose.model('Resume', ResumeSchema);
const JobDescription = mongoose.model('JobDescription', JobDescriptionSchema);
const ApiResponse = mongoose.model('ApiResponse', ApiResponseSchema);

// Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('WebSocket client connected.');
  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected.');
  });
});

// Emit event on new ApiResponse creation
const emitApiResponseUpdate = (newResponse) => {
  io.emit('apiResponseUpdated', newResponse);
};

const resumeDirectory = path.join(__dirname, 'uploads', 'resumes');
const jobDescriptionDirectory = path.join(__dirname, 'uploads', 'job_descriptions');

// Ensure the directories exist
if (!fs.existsSync(resumeDirectory)) {
  fs.mkdirSync(resumeDirectory, { recursive: true });
}
if (!fs.existsSync(jobDescriptionDirectory)) {
  fs.mkdirSync(jobDescriptionDirectory, { recursive: true });
}

// Update the `/api/submit` endpoint to save files locally
app.post('/api/submit', upload.fields([{ name: 'resumes' }, { name: 'job_description' }]), async (req, res) => {
  try {
    const { files } = req;

    if (!files || !files.resumes || !files.job_description) {
      return res.status(400).json({ error: 'Resumes and job descriptions are required.' });
    }

    console.log('Uploading Files:', { resumes: files.resumes, jobDescriptions: files.job_description });

    const results = [];
    const savedJobDescriptions = {};

    // Save job descriptions
    for (const jobDescription of files.job_description) {
      // Save to MongoDB
      if (!savedJobDescriptions[jobDescription.originalname]) {
        const savedJobDescription = new JobDescription({
          title: jobDescription.originalname,
          description: jobDescription.buffer,
          filename: jobDescription.originalname,
        });
        await savedJobDescription.save();
        savedJobDescriptions[jobDescription.originalname] = savedJobDescription._id;
      }

      // Save locally
      const jobDescriptionPath = path.join(jobDescriptionDirectory, jobDescription.originalname);
      fs.writeFileSync(jobDescriptionPath, jobDescription.buffer);
    }

    // Process resumes
    for (const resume of files.resumes) {
      console.log('Processing Resume:', resume.originalname);

      // Save to MongoDB
      const savedResume = new Resume({
        title: resume.originalname,
        pdf: resume.buffer,
        filename: resume.originalname,
      });
      await savedResume.save();

      // Save locally
      const resumePath = path.join(resumeDirectory, resume.originalname);
      fs.writeFileSync(resumePath, resume.buffer);

      for (const jobDescription of files.job_description) {
        const jobDescriptionId = savedJobDescriptions[jobDescription.originalname];

        // Check if this combination of resume and job description already exists
        const existingApiResponse = await ApiResponse.findOne({
          resumeId: savedResume._id,
          jobDescriptionId: jobDescriptionId,
        });

        if (existingApiResponse) {
          console.log(`Duplicate found for Resume: ${resume.originalname} and Job Description: ${jobDescription.originalname}. Skipping.`);
          continue;
        }

        const formData = new FormData();
        formData.append('resumes', resume.buffer, resume.originalname);
        formData.append('job_description', jobDescription.buffer, jobDescription.originalname);

        try {
          const apiResponse = await axios.post(
            'http://13.201.34.119:8001/candidates',
            formData,
            { headers: formData.getHeaders() }
          );

          if (apiResponse.data && apiResponse.data['POST Response']) {
            const savedResponse = new ApiResponse({
              resumeId: savedResume._id,
              jobDescriptionId: jobDescriptionId,
              matchingResult: apiResponse.data['POST Response'],
            });
            await savedResponse.save();
            results.push({
              resume: resume.originalname,
              jobDescription: jobDescription.originalname,
              matchingResult: apiResponse.data['POST Response'],
            });
            emitApiResponseUpdate(savedResponse);
          } else {
            console.warn(`No matching data for Resume: ${resume.originalname} and Job Description: ${jobDescription.originalname}`);
          }
        } catch (error) {
          console.error(`Error with external API for ${resume.originalname}:`, error.message);
        }
      }
    }

    res.status(200).json({ message: 'Files processed and stored successfully.', results });
  } catch (error) {
    console.error('Error processing files:', error.message);
    res.status(500).json({ error: 'Failed to process files.', details: error.message });
  }
});

// Endpoint to fetch all API responses
app.get('/api/candidate-filtering', async (req, res) => {
  try {
    const responses = await ApiResponse.find()
      .populate('resumeId', 'title filename')
      .populate('jobDescriptionId', 'title filename')
      .sort({ createdAt: -1 });

    res.status(200).json(responses);
  } catch (error) {
    console.error('Error fetching candidate filtering data:', error.message);
    res.status(500).json({ error: 'Failed to fetch candidate filtering data.' });
  }
});

// New GET endpoint for resume PDF files
// Endpoint to fetch and convert resume data into PDF
// Serve the PDF for a given resume ID
app.get('/api/resumes/:resumeId', async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { download } = req.query; // Check for "download" query parameter

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ error: 'Invalid resume ID.' });
    }

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    // Decode Base64 to binary
    const binaryPdf = Buffer.from(resume.pdf, 'base64');
    const disposition = download === 'true' 
    ? `attachment; filename="${resume.filename}"`
    : `inline; filename="${resume.filename}"`;
    // Serve the PDF directly
    res.writeHead(200, {
     

      'Content-Type': 'application/pdf',
      'Content-Disposition': disposition,
      'Content-Length': binaryPdf.length,
    });

    res.end(binaryPdf); // Send the binary PDF data to the client
  } catch (error) {
    console.error('Error retrieving resume PDF:', error.message);
    res.status(500).json({ error: 'Failed to retrieve resume PDF.' });
  }
  
});


// Endpoint to fetch all stored resume in locally filenames

app.get('/api/local-resumes', (req, res) => {
  try {
    const resumeDirectory = path.join(__dirname, 'uploads/resumes');
    const allFiles = fs.readdirSync(resumeDirectory);

    if (allFiles.length === 0) {
      return res.status(404).json({ error: 'No resumes found.' });
    }

    const fileDetails = allFiles.map((filename) => ({
      filename,
      path: `/uploads/resumes/${filename}`,
    }));

    res.status(200).json({ resumes: fileDetails });
  } catch (error) {
    console.error('Error fetching local resumes:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


*/