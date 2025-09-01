// Controllers: supplier.controller.js
import Supplier from "../models/supplier.model.js";
import BusinessInformation from "../models/businessInformation.model.js";

const createSupplier = async (req, res) => {
  console.log("req.body.supplier",req)
  try {
    const { name, contactPerson, phone, email, address } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: "Supplier name is required and must be at least 3 characters", success: false });
    }

    const businessInfo = await BusinessInformation.findOne({ owner: req.user._id });
    if (!businessInfo) {
      return res.status(404).json({ message: "Business not found", success: false });
    }

    const supplier = new Supplier({
      business: businessInfo._id,
      name: name.trim(),
      contactPerson: contactPerson?.trim(),
      phone: phone?.trim(),
      email: email?.trim()?.toLowerCase(),
      address: address?.trim(),
    });

    await supplier.save();

    res.status(201).json({ message: "Supplier created successfully", supplier, success: true });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message, success: false });
  }
};

const getSuppliersDetails = async (req, res) => {
  try {
    const businessInfo = await BusinessInformation.findOne({ owner: req.user._id });
    if (!businessInfo) {
      return res.status(404).json({ message: "Business not found", success: false });
    }

    const suppliers = await Supplier.find({ business: businessInfo._id });

    res.status(200).json({ message: "Suppliers retrieved successfully", suppliers, success: true });
  } catch (error) {
    console.error("Error getting suppliers:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message, success: false });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const businessInfo = await BusinessInformation.findOne({ owner: req.user._id });
    if (!businessInfo) {
      return res.status(404).json({ message: "Business not found", success: false });
    }

    const supplier = await Supplier.findOne({ _id: supplierId, business: businessInfo._id });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found", success: false });
    }

    res.status(200).json({ message: "Supplier retrieved successfully", supplier, success: true });
  } catch (error) {
    console.error("Error getting supplier:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message, success: false });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { name, contactPerson, phone, email, address } = req.body;

    const businessInfo = await BusinessInformation.findOne({ owner: req.user._id });
    if (!businessInfo) {
      return res.status(404).json({ message: "Business not found", success: false });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (contactPerson !== undefined) updates.contactPerson = contactPerson.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (email !== undefined) updates.email = email.trim()?.toLowerCase();
    if (address !== undefined) updates.address = address.trim();

    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: supplierId, business: businessInfo._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found", success: false });
    }

    res.status(200).json({ message: "Supplier updated successfully", supplier: updatedSupplier, success: true });
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message, success: false });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const businessInfo = await BusinessInformation.findOne({ owner: req.user._id });
    if (!businessInfo) {
      return res.status(404).json({ message: "Business not found", success: false });
    }

    const deletedSupplier = await Supplier.findOneAndDelete({ _id: supplierId, business: businessInfo._id });

    if (!deletedSupplier) {
      return res.status(404).json({ message: "Supplier not found", success: false });
    }

    res.status(200).json({ message: "Supplier deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message, success: false });
  }
};

export {
  createSupplier,
  getSuppliersDetails,
  getSupplierById,
  updateSupplier,
  deleteSupplier
};