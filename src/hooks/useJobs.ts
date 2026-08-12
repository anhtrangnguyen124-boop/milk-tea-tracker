import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { db } from '@/services/db'
import { deleteEntryImages } from '@/services/entryImages'
import type { JobEntry, JobReview } from '@/types'

export type NewJob = Omit<JobEntry, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateJob = Partial<Omit<JobEntry, 'id' | 'createdAt' | 'updatedAt'>> & { id: number }
export type NewJobReview = Omit<JobReview, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateJobReview = Partial<Omit<JobReview, 'id' | 'createdAt' | 'updatedAt'>> & { id: number }

function invalidateJobs(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['jobs'] }),
    queryClient.invalidateQueries({ queryKey: ['jobReviews'] }),
  ])
}

export function useJobs() {
  return useQuery({
    queryKey: ['jobs', 'all'],
    queryFn: () => db.jobs.orderBy('date').reverse().toArray(),
  })
}

export function useJobReviews() {
  return useQuery({
    queryKey: ['jobReviews', 'all'],
    queryFn: () => db.jobReviews.orderBy('date').reverse().toArray(),
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (job: NewJob) => {
      const now = new Date()
      const id = await db.jobs.add({ ...job, createdAt: now, updatedAt: now } as JobEntry)
      return { ...job, id, createdAt: now, updatedAt: now } as JobEntry
    },
    onSuccess: () => invalidateJobs(queryClient),
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateJob) => {
      await db.jobs.update(id, { ...updates, updatedAt: new Date() })
    },
    onSuccess: () => invalidateJobs(queryClient),
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const job = await db.jobs.get(id)
      if (job?.jdImageIds.length) await deleteEntryImages(job.jdImageIds)
      await db.transaction('rw', db.jobs, db.jobReviews, async () => {
        await db.jobReviews.where('jobId').equals(id).delete()
        await db.jobs.delete(id)
      })
    },
    onSuccess: () => invalidateJobs(queryClient),
  })
}

export function useCreateJobReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (review: NewJobReview) => {
      const now = new Date()
      await db.jobReviews.add({ ...review, createdAt: now, updatedAt: now } as JobReview)
    },
    onSuccess: () => invalidateJobs(queryClient),
  })
}

export function useUpdateJobReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateJobReview) => {
      await db.jobReviews.update(id, { ...updates, updatedAt: new Date() })
    },
    onSuccess: () => invalidateJobs(queryClient),
  })
}

export function useDeleteJobReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => db.jobReviews.delete(id),
    onSuccess: () => invalidateJobs(queryClient),
  })
}
