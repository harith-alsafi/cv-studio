"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Search, Star, MoreVertical, Trash2, GripVertical, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

// Mock data for job applications
const mockJobs = [
  {
    id: "1",
    jobTitle: "Software Engineer",
    company: "Tech Solutions Inc.",
    deadline: "2024-08-15",
    rating: 4,
    status: "applied",
    jobUrl: "/jobs/1",
  },
  {
    id: "2",
    jobTitle: "Product Manager",
    company: "Innovate Co.",
    deadline: "2024-08-20",
    rating: 5,
    status: "interviewing",
    jobUrl: "/jobs/2",
  },
  {
    id: "3",
    jobTitle: "UX/UI Designer",
    company: "Creative Minds LLC",
    deadline: "2024-08-10",
    rating: 3,
    status: "pending",
    jobUrl: "/jobs/3",
  },
  {
    id: "4",
    jobTitle: "Data Scientist",
    company: "DataDriven Corp",
    deadline: "2024-09-01",
    rating: 0,
    status: "offer",
    jobUrl: "/jobs/4",
  },
  {
    id: "5",
    jobTitle: "DevOps Engineer",
    company: "CloudNine Services",
    deadline: "2024-08-25",
    rating: 2,
    status: "rejected",
    jobUrl: "/jobs/5",
  },
]

type JobStatus = "applied" | "pending" | "interviewing" | "offer" | "rejected";

export default function JobTrackerDashboard() {
  const [jobs, setJobs] = useState(mockJobs)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])

  const handleRatingChange = (id: string, rating: number) => {
    setJobs(jobs.map((job) => (job.id === id ? { ...job, rating } : job)))
  }

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id))
  }

  const stats = useMemo(() => {
    const total = jobs.length;
    const interviewing = jobs.filter((j) => j.status === "interviewing").length;
    const offers = jobs.filter((j) => j.status === "offer").length;
    const applied = jobs.filter((j) => j.status === 'applied').length;
    const pending = jobs.filter((j) => j.status === 'pending').length;
    return {
      total,
      interviewing,
      offers,
      applied,
      pending
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const matchesSearch = 
          job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || job.status === statusFilter
        return matchesSearch && matchesStatus
      })
  }, [jobs, searchTerm, statusFilter])

  const handleStatusChange = (id: string, newStatus: JobStatus) => {
    setJobs(jobs.map((job) => (job.id === id ? { ...job, status: newStatus } : job)))
  }

  const handleDeleteSelected = () => {
    setJobs(jobs.filter((job) => !selectedJobs.includes(job.id)))
    setSelectedJobs([])
    setIsEditMode(false)
  }

  const toggleSelectJob = (id: string) => {
    setSelectedJobs((prev) => 
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    )
  }

  const renderRating = (jobId: string, rating: number) => {
    return (
      <div className="flex items-center">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} cursor-pointer`}
              onClick={() => handleRatingChange(jobId, i + 1)}
            />
          ))}
      </div>
    )
  }

  const renderStatusDropdown = (job: typeof mockJobs[0]) => {
    const statusClasses: Record<JobStatus, string> = {
        applied: "bg-blue-100 text-blue-800",
        pending: "bg-yellow-100 text-yellow-800",
        interviewing: "bg-purple-100 text-purple-800",
        offer: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
    }

    return (
        <Select value={job.status} onValueChange={(value) => handleStatusChange(job.id, value as JobStatus)}>
            <SelectTrigger className={`w-[120px] text-xs h-8 ${statusClasses[job.status as JobStatus]}`}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
        </Select>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {/* Create New CV Button */}
      <div className="flex justify-center mb-10">
        <Link href="/" passHref legacyBehavior>
          <a>
            <Button
              className="flex items-center justify-center gap-8 px-12 py-8 text-3xl font-extrabold rounded-2xl shadow-xl text-white border-0 focus:outline-none"
              style={{
                minWidth: 380,
                background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)',
                boxShadow: '0 8px 32px rgba(37,99,235,0.25)'
              }}
            >
              Create CV
            </Button>
          </a>
        </Link>
      </div>


      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applied</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviewing</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.interviewing}</div>
                <p className="text-xs text-muted-foreground">{`${stats.total > 0 ? Math.round((stats.interviewing / stats.total) * 100) : 0}% of total`}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.offers}</div>
                <p className="text-xs text-muted-foreground">Your hard work is paying off!</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.applied + stats.pending + stats.interviewing}</div>
                <p className="text-xs text-muted-foreground">Keep the momentum going!</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job title or company..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setIsEditMode(!isEditMode)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Cancel' : 'Edit'}
                </Button>
            </div>
          </div>

          {isEditMode && (
            <div className="flex justify-between items-center mb-4 p-2 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedJobs.length} selected</span>
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={selectedJobs.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {isEditMode && (
                    <TableHead className="w-[50px]">
                        <Checkbox 
                            checked={selectedJobs.length > 0 && selectedJobs.length === filteredJobs.length}
                            onCheckedChange={(checked) => {
                                if(checked) {
                                    setSelectedJobs(filteredJobs.map(j => j.id))
                                } else {
                                    setSelectedJobs([])
                                }
                            }}
                        />
                    </TableHead>
                  )}
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-[150px]">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      {isEditMode && (
                        <TableCell>
                            <Checkbox 
                                checked={selectedJobs.includes(job.id)}
                                onCheckedChange={() => toggleSelectJob(job.id)}
                            />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        <Link href={job.jobUrl} className="hover:underline">
                          {job.jobTitle}
                        </Link>
                      </TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{new Date(job.deadline).toLocaleDateString()}</TableCell>
                      <TableCell>{renderRating(job.id, job.rating)}</TableCell>
                      <TableCell>{renderStatusDropdown(job)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Application</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteJob(job.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isEditMode ? 7 : 6} className="h-24 text-center">
                      No job applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
