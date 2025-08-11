/*
 * This file holds the structured data for the website. The
 * information here is used to build each section dynamically in
 * app.js. You can update the values below to quickly adjust the
 * content without editing the HTML structure. All date strings
 * follow the format "Month Year – Month Year" for consistency. If
 * you need to omit an end date (e.g. ongoing positions), simply
 * use "Present" as the end date.
 */

window.CONTENT = {
  personal: {
    name: "Sandip Gautam",
    tagline: "Graduate Research Assistant | Mechanical Engineering",
    description:
      "I am a mechanical engineer and researcher exploring vortex-surface interactions, fluid dynamics and aerospace design. Currently pursuing my Master of Science at the University of New Hampshire, I love translating complex phenomena into meaningful insights and innovative designs.",
    contacts: [
      { type: "Email", value: "sandip.gautam@unh.edu", link: "mailto:sandip.gautam@unh.edu" },
      { type: "Phone", value: "+603 817 4400", link: "tel:+6038174400" },
      { type: "Location", value: "Durham, NH, USA", link: null }
    ],
    cvLink: "Sandip_Gautam_Grad_Resume.pdf"
  },
  about: {
    paragraphs: [
      "Hello! I’m Sandip, an aspiring mechanical engineer and researcher with a passion for fluid mechanics, and experimental and numerical methods. I enjoy spending my time solving complex problems related to fluid and contributing to advances in engineering through thoughtful experimentation and simulation.",
      "After earning my Bachelor’s degree in Aerospace Engineering at Tribhuvan University, Institute of Engineering, Pulchowk Campus in Nepal, I am now pursuing my fully funded master’s degree in Mechanical Engineering at the University of New Hampshire. My current research explores vortex-surface interactions in unsteady and gusting environments as part of an Air Force Office of Scientific Research project.",
      "In addition to my research, I’ve worked on numerous academic projects ranging from partical image velocity to computationally designing the axial flow compressor, and I’ve volunteered in educational initiatives promoting space sciences, ocean sciences etc. These experiences have cultivated my skills in programming, simulation, and teamwork and inspired me to continue learning and sharing knowledge."
    ]
  },
  education: [
    {
      degree: "Master of Science in Mechanical Engineering",
      institution: "University of New Hampshire",
      location: "Durham, NH, USA",
      period: "Aug 2024 – Present",
      details: "Graduate research assistant focusing on vortex-surface interactions in unsteady and gusting environments within the Ocean Hydrodynamics Lab. Work involves conducting fluid dynamics experiments like free surface synthetic schlieren, thermal imagery, particle image velocimetry, and data analysis under AFOSR funding."
    },
    {
      degree: "Bachelor of Engineering in Aerospace Engineering",
      institution: "Tribhuvan University, Institute of Engineering, Pulchowk Campus",
      location: "Kathmandu, Nepal",
      period: "Nov 2018 – Apr 2023",
      details: "Completed a variety of projects including UAV design, heat transfer analysis, and aerodynamic compressor design. Developed skills in Python, MATLAB, ANSYS, CAD and control systems. Bachelor thesis focused on designing and fabricating a PIV towing tank setup for low Reynolds number experimentation."
    }
  ],
  experience: [
    {
      title: "Graduate Research Assistant",
      organization: "University of New Hampshire",
      period: "Aug 2024 – Present",
      details: [
        "Conduct experiments in an open-channel recirculating flume to investigate vortex behavior in unsteady and gusting environments.",
        "Capture and analyze free-surface elevation maps, thermal fields, and surface-parallel velocity data.",
        "Perform particle image velocimetry (PIV) to examine sub-surface vortex dynamics and correlate surface signatures with vortex structures.",
        "Collaborate with interdisciplinary teams, manage timelines, and present progress to stakeholders.",
        "Advisor: Dr. Tracy Mandel, Ocean Hydrodynamics Lab"
      ]
    },
    {
      title: "Bachelor Thesis – PIV Setup Fabrication",
      organization: "Tribhuvan University",
      period: "Jun 2022 – Mar 2023",
      details: [
        "Designed and built a functional towing tank for PIV measurements equipped with a load cell to acquire accurate lift data for validating PIV results.",
        "Executed particle image velocimetry measurements on a flat plate at a Reynolds number of 6,040 using Python for dynamic airfoil masking and image processing through PIVlab.",
        "Performed CFD simulations of a flat plate to study the laminar separation bubble using Ansys Fluent, replicating experimental conditions.",
        "Conducted a qualitative analysis of error sources in a cost-effective PIV setup."
      ]
    },
    {
      title: "Research Intern",
      organization: "Antarikchya Pratisthan Nepal",
      period: "Oct 2022 – Dec 2022",
      details: [
        "Conducted literature review on CubeSat testing and the feasibility of a thermal vacuum chamber in Nepal.",
        "Performed preliminary structural and thermal design of a thermal vacuum chamber for 6U CubeSat testing.",
        "Produced reports and presentations and presented at International Space Day at NAST."
      ]
    },
    {
      title: "Committee Member",
      organization: "SEDS Pulchowk",
      period: "2020 – 2021",
      details: [
        "Contributed to organizing various space science programs at Pulchowk Campus.",
        "Supported event logistics and outreach efforts." 
      ]
    },
    {
      title: "Volunteer",
      organization: "10th National Mechanical Engineering Expo",
      period: "Jan 2020",
      details: [
        "Assisted the organizing committee in hosting a water rocket competition for secondary-level students."
      ]
    }
  ],
  projects: [
    {
      name: "Bijuli – Powerline Inspection UAV",
      period: "Jun 2022 – Jan 2023",
      description:
        "Designed a fixed-wing battery-powered UAV for power line inspection in Nepal, including stability analyses and a poster presentation detailing the UAV's capabilities.",
      tags: ["Aerodynamics", "UAV Design", "Python"],
      // Placeholder image – replace this with your own photo in the images folder
      image: "images/placeholder.png",
      longDescription:
        "Designed a fixed-wing battery-powered UAV for power line inspection in Nepal. The project included preliminary aerodynamic sizing, stability and control analyses, structural considerations, and mission planning. Developed Python scripts to evaluate aerodynamic performance across flight envelopes and produced a comprehensive poster presentation detailing the UAV's capabilities and potential impact on power line maintenance."
    },
    {
      name: "Finite Element Heat Conduction",
      period: "Mar 2022 – Apr 2022",
      description:
        "Enhanced MATLAB code for two-dimensional heat conduction using the finite element method, adding functionality for internal heat sources and temperature and flux calculations.",
      tags: ["MATLAB", "Finite Element", "Heat Transfer"],
      image: "images/placeholder.png",
      longDescription:
        "Enhanced existing MATLAB code for two-dimensional heat conduction using the finite element method. Added functionality to account for internal heat sources and included routines to compute both temperature distribution and heat flux through the domain. The project improved numerical stability and provided additional visualization outputs, making the tool more versatile for thermal analysis."
    },
    {
      name: "Axial Flow Compressor Design",
      period: "Aug 2021 – Nov 2021",
      description:
        "Gained hands-on experience in designing and analyzing a subsonic axial flow compressor using CATIA V5, Ansys TurboGrid, and Ansys CFX for performance analysis.",
      tags: ["CFD", "CATIA", "Ansys"],
      image: "images/placeholder.png",
      longDescription:
        "Gained hands-on experience designing and analyzing a subsonic axial flow compressor. Used CATIA V5 to model blade and hub geometry, generated high-quality meshes with Ansys TurboGrid, and performed CFD simulations in Ansys CFX to evaluate compressor performance metrics such as pressure ratio and efficiency. Learned how blade shape affects flow separation and optimized design parameters to meet target performance."
    },
    {
      name: "Lift & Drag Data Acquisition",
      period: "Jan 2021 – Feb 2021",
      description:
        "Designed a setup using a load cell, LabVIEW, and NI DAQmx to collect lift and drag data of a NACA 0012 airfoil, with CFD validation using Ansys.",
      tags: ["DAQ", "LabVIEW", "CFD"],
      image: "images/placeholder.png",
      longDescription:
        "Designed and built an experimental setup using a load cell, LabVIEW, and NI DAQmx to acquire lift and drag data for a NACA 0012 airfoil. Integrated control and data acquisition hardware to capture force measurements, synchronized with flow conditions. Validated experimental results through CFD simulations in Ansys, comparing lift and drag coefficients across angle of attack ranges and identifying sources of experimental error."
    },
    {
      name: "Aircraft Exhaust Stack Trolley",
      period: "2020",
      description:
        "Carried out the design of a trolley to facilitate safe handling and mobility of aircraft exhaust stack pipes, including structural and ergonomics analysis using CATIA V5.",
      tags: ["Mechanical Design", "CATIA"],
      image: "images/placeholder.png",
      longDescription:
        "Designed a mobile trolley system to facilitate safe handling and transport of aircraft exhaust stack pipes. Performed structural analysis and ergonomics assessments using CATIA V5 to ensure the trolley could support the required loads while remaining easy to maneuver. Considered manufacturing constraints and proposed a cost-effective fabrication plan."
    },
    {
      name: "Quadcopter Design & Fabrication",
      period: "2020",
      description:
        "Built a quadcopter using an Arduino Uno microcontroller, implementing PID control for roll and pitch stabilization for demonstration at MechTRIX-X.",
      tags: ["Arduino", "Control Systems", "PID"],
      image: "images/placeholder.png",
      longDescription:
        "Constructed a quadcopter using an Arduino Uno microcontroller and off-the-shelf components. Implemented PID control algorithms for roll and pitch stabilization and tuned parameters to achieve steady hover. Demonstrated the quadcopter’s capabilities at MechTRIX-X, highlighting the integration of embedded programming, control theory, and mechanical design."
    }
  ],
  skills: {
    languages: ["Python", "Fortran", "C", "MATLAB"],
    software: ["CATIA", "Solidworks", "Ansys (Fluent, Structural, CFX)", "OpenFOAM", "LabVIEW", "Microsoft Office"],
    softSkills: ["Problem Solving", "Team Work", "Time Management", "Flexibility"],
    other: ["Control System Design (PIV, LQG, LQR)", "LaTeX"]
  },
  tests: [
    { name: "GRE", score: "320", details: "Quant: 167, Verbal: 153, AWA: 3.5", date: "Oct 12, 2023" },
    { name: "TOEFL", score: "103", details: "Reading: 29, Listening: 29, Writing: 22, Speaking: 23", date: "Dec 02, 2023" }
  ],
  presentations: [
    {
      title: "Free-surface signatures of counter-rotating vortex pairs in the ocean",
      event: "School of Marine Science & Ocean Engineering Graduate Research Symposium",
      location: "University of New Hampshire",
      date: "March 12, 2025"
    }

    {
      title: "Free-surface response to counter-rotating vortex pairs",
      event: "Rocky Mountain Fluid Mechanics Symposium",
      location: "University of Colorado Boulder",
      date: "April 8, 2025"
    }
  ],
  // News and upcoming events. Each entry should include a title, date and
  // description. You can add more items or edit existing ones to update
  // your news page without touching the HTML structure.
  news: [
    {
      title: "Presenting at the Rocky mountain fluid symposium",
      date: "August 8, 2025",
      location: "University of Colorado, Boulder",
      description:
        "I will be attending and presenting my research progress and findings on vortex–surface interactions at the Fluid Mechanics Conference in Boulder, Colorado. Looking forward to engaging with experts in the field and discussing exciting new results."
    },
    {
      title: "Visiting Research Collaborators at Montana State University",
      date: "August 3, 2025",
      location: "Bozeman, Montana, USA",
      description:
        "I will be traveling to Montana State University to meet with our collaborators working on the near-field dynamics of vortex-surface interactions. During the visit, I’ll be learning about the flow visualization techniques they are using and observing their PIV setup to help replicate a similar system at UNH. Looking forward to the opportunity to learn from experts in the field."
    },
    {
      title: "Oral Presentation at American Physical Society: Division of Fluid Dynamics",
      date: "November 23-25, 2025",
      location: "Houston, Texas, USA",
      description:
        "I will be attending and presenting my research progress and findings on vortex–surface interactions at the largest Fluid Mechanics Conference to be held in Houston, Texas. Looking forward to engaging with experts in the field and discussing exciting new results."
    }
  ]
};
