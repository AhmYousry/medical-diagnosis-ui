import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { doctorsService } from "@/services/doctorsService"
import { Stethoscope, Loader2 } from "lucide-react"

const SPECIALIZATIONS = [
  "Radiology",
  "Cardiology",
  "Neurology",
  "Oncology",
  "Pathology",
  "Dermatology",
  "Ophthalmology",
  "Orthopedics",
  "Internal Medicine",
  "General Practice",
] as const

export default function DoctorRegisterPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [licenseNumber, setLicenseNumber] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [clinicName, setClinicName] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    licenseNumber?: string
    specialization?: string
  }>({})

  function validate() {
    const errs: typeof errors = {}
    if (!licenseNumber.trim()) {
      errs.licenseNumber = "License number is required"
    }
    if (!specialization) {
      errs.specialization = "Please select a specialization"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await doctorsService.register({
        license_number: licenseNumber.trim(),
        specialization,
        clinic_name: clinicName.trim() || undefined,
        bio: bio.trim() || undefined,
      })
      toast({
        title: "Application submitted",
        description: "Your doctor application has been submitted for review.",
      })
      navigate("/doctor/pending")
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data?: { detail?: string } } }).response?.data?.detail ||
            "Submission failed"
          : "Submission failed"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
            <Stethoscope className="h-7 w-7 text-white" />
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Doctor Registration</CardTitle>
            <CardDescription>
              Already have a patient account? Apply to become a verified doctor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number *</Label>
                <Input
                  id="licenseNumber"
                  type="text"
                  placeholder="e.g. MD-12345"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className={errors.licenseNumber ? "border-destructive" : ""}
                />
                {errors.licenseNumber && (
                  <p className="text-sm text-destructive">{errors.licenseNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Select value={specialization} onValueChange={setSpecialization}>
                  <SelectTrigger
                    id="specialization"
                    className={errors.specialization ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specialization && (
                  <p className="text-sm text-destructive">{errors.specialization}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic Name (optional)</Label>
                <Input
                  id="clinicName"
                  type="text"
                  placeholder="Your clinic or hospital name"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your experience and qualifications"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
