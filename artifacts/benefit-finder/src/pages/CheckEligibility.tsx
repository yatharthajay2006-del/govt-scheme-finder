import { useState } from "react";
import { useLocation } from "wouter";
import { useCheckEligibility } from "@workspace/api-client-react";
import { EligibilityProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { VoiceInput } from "@/components/VoiceInput";
import { ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

export function CheckEligibility() {
  const [_, setLocation] = useLocation();
  const { t, language } = useI18n();
  const [step, setStep] = useState(1);
  const checkMutation = useCheckEligibility();

  const [profile, setProfile] = useState<EligibilityProfile>({
    name: "",
    age: null,
    gender: "",
    state: "",
    isStudent: false,
    educationLevel: "",
    annualIncome: null,
    casteCategory: "",
    hasDisability: false,
    isFarmer: false,
    employmentStatus: "",
    hasRationCard: false,
    isSeniorCitizen: false
  });

  const handleVoiceParse = (parsedProfile: Partial<EligibilityProfile>, fields: string[]) => {
    setProfile(prev => {
      const updated = { ...prev };
      fields.forEach(field => {
        if (field in parsedProfile) {
          (updated as any)[field] = (parsedProfile as any)[field];
        }
      });
      
      // Auto-update derived fields
      if (updated.age && updated.age >= 60) updated.isSeniorCitizen = true;
      if (updated.isStudent) updated.employmentStatus = "student";
      
      return updated;
    });
  };

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const onSubmit = () => {
    // Final pre-processing
    const finalProfile = { ...profile };
    if (finalProfile.age && finalProfile.age >= 60) finalProfile.isSeniorCitizen = true;
    
    checkMutation.mutate({ data: finalProfile }, {
      onSuccess: (result) => {
        sessionStorage.setItem("last-eligibility-result", JSON.stringify(result));
        setLocation("/results");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Check Your Eligibility</h1>
        <p className="text-muted-foreground mb-6">Answer a few questions to find schemes you qualify for. Your data is not stored permanently.</p>
        
        <div className="bg-primary/5 rounded-xl p-4 mb-8 border border-primary/10 flex items-start gap-4">
          <div className="mt-1 bg-primary/20 p-2 rounded-full text-primary">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Prefer to just talk?</h3>
            <p className="text-sm text-muted-foreground mb-3">Speak naturally in English or Hindi and our AI will fill the form for you.</p>
            <VoiceInput 
              language={language}
              onTranscript={() => {}}
              onParsed={handleVoiceParse}
              variant="default"
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-2 text-sm font-medium text-muted-foreground">
          <span>Step {step} of 4</span>
          <span>{Math.round((step / 4) * 100)}% Completed</span>
        </div>
        <Progress value={(step / 4) * 100} className="h-2" />
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-2">Basic Information</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name (Optional)</Label>
                  <Input id="name" value={profile.name || ""} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="E.g. Priya Sharma" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={profile.age || ""} onChange={e => setProfile({...profile, age: e.target.value ? parseInt(e.target.value) : null})} placeholder="E.g. 25" />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup value={profile.gender || ""} onValueChange={v => setProfile({...profile, gender: v})} className="flex gap-4">
                    <div className="flex items-center space-x-2 border rounded-md p-3 flex-1 justify-center bg-muted/20 has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:border-primary">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3 flex-1 justify-center bg-muted/20 has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:border-primary">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3 flex-1 justify-center bg-muted/20 has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:border-primary">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="cursor-pointer">Other</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>State of Residence</Label>
                  <Select value={profile.state || ""} onValueChange={v => setProfile({...profile, state: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-2">Education & Income</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/10">
                  <div className="space-y-0.5">
                    <Label className="text-base">Are you currently a student?</Label>
                    <p className="text-sm text-muted-foreground">This unlocks scholarship schemes.</p>
                  </div>
                  <Switch checked={profile.isStudent || false} onCheckedChange={v => setProfile({...profile, isStudent: v, employmentStatus: v ? "student" : profile.employmentStatus})} />
                </div>

                {profile.isStudent && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary/30 ml-2">
                    <Label>Current Education Level</Label>
                    <Select value={profile.educationLevel || ""} onValueChange={v => setProfile({...profile, educationLevel: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school">School (Up to 12th)</SelectItem>
                        <SelectItem value="undergraduate">Undergraduate (College)</SelectItem>
                        <SelectItem value="postgraduate">Postgraduate</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="income">Family Annual Income (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                    <Input 
                      id="income" 
                      type="number" 
                      className="pl-8"
                      value={profile.annualIncome || ""} 
                      onChange={e => setProfile({...profile, annualIncome: e.target.value ? parseInt(e.target.value) : null})} 
                      placeholder="e.g. 250000" 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Many schemes depend on income thresholds.</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-2">Social & Employment Status</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Caste / Category</Label>
                  <Select value={profile.casteCategory || ""} onValueChange={v => setProfile({...profile, casteCategory: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="obc">OBC</SelectItem>
                      <SelectItem value="sc">SC</SelectItem>
                      <SelectItem value="st">ST</SelectItem>
                      <SelectItem value="minority">Minority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Employment Status</Label>
                  <Select value={profile.employmentStatus || ""} onValueChange={v => setProfile({...profile, employmentStatus: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="self_employed">Self Employed</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/10">
                    <Label className="cursor-pointer" htmlFor="farmer">Farmer?</Label>
                    <Switch id="farmer" checked={profile.isFarmer || false} onCheckedChange={v => setProfile({...profile, isFarmer: v})} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/10">
                    <Label className="cursor-pointer" htmlFor="disability">Disability?</Label>
                    <Switch id="disability" checked={profile.hasDisability || false} onCheckedChange={v => setProfile({...profile, hasDisability: v})} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/10">
                    <Label className="cursor-pointer" htmlFor="ration">Ration Card?</Label>
                    <Switch id="ration" checked={profile.hasRationCard || false} onCheckedChange={v => setProfile({...profile, hasRationCard: v})} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/10 opacity-70">
                    <div className="space-y-0.5">
                      <Label className="cursor-pointer" htmlFor="senior">Senior Citizen</Label>
                      <p className="text-[10px] text-muted-foreground">Auto-checked if age ≥ 60</p>
                    </div>
                    <Switch id="senior" disabled checked={profile.isSeniorCitizen || (profile.age ? profile.age >= 60 : false)} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Ready to find your matches</h2>
                <p className="text-muted-foreground">Review your information before we search the database.</p>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div><span className="text-muted-foreground block mb-1">Age</span><span className="font-medium">{profile.age || 'Not provided'}</span></div>
                <div><span className="text-muted-foreground block mb-1">State</span><span className="font-medium">{profile.state || 'Not provided'}</span></div>
                <div><span className="text-muted-foreground block mb-1">Income</span><span className="font-medium">{profile.annualIncome ? `₹${profile.annualIncome.toLocaleString()}` : 'Not provided'}</span></div>
                <div><span className="text-muted-foreground block mb-1">Student</span><span className="font-medium">{profile.isStudent ? 'Yes' : 'No'}</span></div>
                <div><span className="text-muted-foreground block mb-1">Category</span><span className="font-medium uppercase">{profile.casteCategory || 'General'}</span></div>
                <div><span className="text-muted-foreground block mb-1">Farmer</span><span className="font-medium">{profile.isFarmer ? 'Yes' : 'No'}</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t flex items-center justify-between">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            <ChevronLeft className="mr-2" size={16} /> Back
          </Button>
          
          {step < 4 ? (
            <Button onClick={nextStep} className="px-8">
              Next <ChevronRight className="ml-2" size={16} />
            </Button>
          ) : (
            <Button 
              onClick={onSubmit} 
              disabled={checkMutation.isPending}
              className="px-8 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity shadow-md"
            >
              {checkMutation.isPending ? "Searching..." : "Find My Schemes"}
              {!checkMutation.isPending && <Sparkles className="ml-2" size={16} />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}