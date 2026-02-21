import React, { useState, useEffect, useRef } from "react";
import { FiCode } from "react-icons/fi";
import { fetchData, createData, updateData, deleteData } from "../api";

const ProjectsSection = ({ editData, isEditing, onSave }) => {
  const technologyOptions = [
    "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js",
    "Express", "MongoDB", "PostgreSQL", "MySQL", "Python", "Django",
    "Flask", "Java", "Spring", "PHP", "Laravel", "C#", ".NET",
    "Ruby", "Ruby on Rails", "GraphQL", "REST API", "AWS", "Docker",
    "Kubernetes", "Redis", "Firebase", "Go", "Swift",
  ];
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    repourl: "",
    deployurl: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckboxChange = (tech) => {
    if (selectedTechnologies.includes(tech)) {
      setSelectedTechnologies(
        selectedTechnologies.filter((item) => item !== tech)
      );
    } else {
      setSelectedTechnologies([...selectedTechnologies, tech]);
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      technologies: selectedTechnologies.join(", "),
    }));
  }, [selectedTechnologies]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isEditing && editData) {
      setFormData(editData);
      if (editData.technologies) {
        setSelectedTechnologies(
          editData.technologies.split(", ").filter(Boolean)
        );
      }
    } else {
      setFormData({
        title: "",
        description: "",
        technologies: "",
        repourl: "",
        deployurl: "",
        startDate: "",
        endDate: "",
      });
      setSelectedTechnologies([]);
    }
    setErrors({});
  }, [editData, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Project title is required";
    if (!formData.description) newErrors.description = "Project description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProject = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const dataToSave = { 
        ...formData,
        technologies: selectedTechnologies.join(", ")
      };
      
      let result;
      if (isEditing && editData?._id) {
        result = await updateData('projects', editData._id, dataToSave);
      } else {
        result = await createData('projects', dataToSave);
      }
      onSave(result);
    } catch (error) {
      console.error('Error saving project data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!isEditing || !editData?._id) return;
    setIsLoading(true);
    try {
      await deleteData('projects', editData._id);
      onSave(null);
    } catch (error) {
      console.error('Error deleting project data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-white/60 mb-2 text-xs uppercase tracking-widest">
            Project Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title || ""}
            onChange={handleInputChange}
            placeholder="Enter project title"
            className={`w-full bg-white/5 border ${
              errors.title ? "border-red-500" : "border-white/10"
            } rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-white/60 mb-2 text-xs uppercase tracking-widest">
            Project Description <span className="text-red-600">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleInputChange}
            placeholder="Describe your project"
            rows="4"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-white/60 mb-2 text-xs uppercase tracking-widest">
            Technologies Used
          </label>
          <div className="relative" ref={dropdownRef}>
            <div
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer flex justify-between items-center"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex flex-wrap gap-1">
                {selectedTechnologies.length > 0 ? (
                  selectedTechnologies.map((tech, index) => (
                    <span key={index} className="bg-lime-400/10 text-lime-400 text-xs px-2 py-1 rounded-md">
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-white/20 text-sm">Select technologies...</span>
                )}
              </div>
              <FiCode className="text-white/20" />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2">
                {technologyOptions.map((tech, index) => (
                  <div key={index} className="flex items-center p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      id={`tech-${index}`}
                      checked={selectedTechnologies.includes(tech)}
                      onChange={() => handleCheckboxChange(tech)}
                      className="mr-3 h-4 w-4 rounded border-white/10 text-lime-400 focus:ring-lime-400"
                    />
                    <label htmlFor={`tech-${index}`} className="text-white/60 text-sm cursor-pointer w-full">
                      {tech}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-white/60 mb-2 text-xs uppercase tracking-widest">Repository URL</label>
          <input
            type="text"
            name="repourl"
            value={formData.repourl || ""}
            onChange={handleInputChange}
            placeholder="https://github.com/..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-white/60 mb-2 text-xs uppercase tracking-widest">Deployment URL</label>
          <input
            type="text"
            name="deployurl"
            value={formData.deployurl || ""}
            onChange={handleInputChange}
            placeholder="https://project.vercel.app"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/5">
        {isEditing && (
          <button
            onClick={deleteProject}
            className="px-6 py-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-bold text-sm"
            type="button"
            disabled={isLoading}
          >
            Delete
          </button>
        )}
        <button
          onClick={saveProject}
          className="px-8 py-3 bg-lime-400 text-black font-black rounded-xl hover:bg-lime-300 transition-all shadow-lg shadow-lime-400/10"
          type="button"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : isEditing ? "Update Project" : "Add to Portfolio"}
        </button>
      </div>
    </>
  );
};

export default ProjectsSection;