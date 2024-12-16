/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { string, z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { checkCredits, indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional()
        })
    ).mutation(async ({ ctx, input }) => {
        const user = await ctx.db.user.findUnique({where: {id: ctx.user.userId!}, select: {credits: true}});
        if(!user){
            throw new Error("User not found");
        }

        const currentCredits = user.credits || 0;
        const fileCount = await checkCredits(input.githubUrl, input.githubToken);

        if(currentCredits < fileCount){
            throw new Error('Insufficent Credits');
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const project = await ctx.db.project.create({
            data: {
                githubUrl: input.githubUrl,
                name: input.name,
                userToProject: {
                    create: {
                        userId: ctx.user.userId!,
                    }
                }
            }
        });
        // we will call this function every time we create a project
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
        await pollCommits(project.id)
        await ctx.db.user.update({where: {id: ctx.user.userId!}, data:{credits: {decrement: fileCount}}});
        return project;
    }),
    getProjects: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.project.findMany({
            where: {
                userToProject: {
                    some: {
                        userId: ctx.user.userId!,
                    }
                },
                deletedAt: null
            }
        })
    }),
    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ ctx, input }) => {
        pollCommits(input.projectId).then().catch(console.error)
        return await ctx.db.commit.findMany({ where: { projectId: input.projectId } })
    }),
    saveQuestion: protectedProcedure.input(z.object({
        projectId: z.string(),
        question: z.string(),
        fileRefrence: z.any(),
        answer: z.string()
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.question.create({
            data: {
                answer: input.answer,
                question: input.question,
                fileReference: input.fileRefrence,
                projectId: input.projectId,
                userId: ctx.user.userId!
            }
        })
    }),
    getQuestions: protectedProcedure.input(z.object({
        projectId: z.string(),
    })).query(async ({ ctx, input }) => {
        return await ctx.db.question.findMany({
            where: {
                projectId: input.projectId
            },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }),
    uploadMeeting: protectedProcedure.input(z.object({ projectId: z.string(), meetingUrl: z.string(), name: z.string(), fileId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.meeting.create({
            data: {
                meetingUrl: input.meetingUrl,
                projectId: input.projectId,
                name: input.name,
                fileId: input.fileId,
                status: "PROCESSING"
            }
        })
    }),
    getMeeetings: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findMany({ where: { projectId: input.projectId }, include: { issues: true } })
    }),
    deleteMeeting: protectedProcedure.input(z.object({ meetingId: z.string() })).mutation(async ({ ctx, input }) => {
        await ctx.db.issue.deleteMany({
            where: {
                meetingId: input.meetingId,
            }
        });
        return await ctx.db.meeting.delete({ where: { id: input.meetingId } })
    }),
    getIssuesList: protectedProcedure.input(z.object({ meetingId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findUnique({ where: { id: input.meetingId }, include: { issues: true } });
    }),
    archiveProject: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.project.update({ where: { id: input.projectId }, data: { deletedAt: new Date() } })
    }),
    getTeamMembers: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return ctx.db.userToProject.findMany({
            where: {
                projectId: input.projectId,
            },
            include: {
                user: true,
            }
        })
    }),
    getMyCredits: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.user.findUnique({
            where: {
                id: ctx.user.userId!,
            },
            select: {
                credits: true,
            }
        })
    }),
    creditRequired: protectedProcedure.input(z.object({ githubUrl: z.string(), githubToken: z.string().optional() })).mutation(async ({ ctx, input }) => {
        const fileCount = await checkCredits(input.githubUrl, input.githubToken);
        const userCredits = await ctx.db.user.findUnique({ where: { id: ctx.user.userId! }, select: { credits: true } });
        return { fileCount, userCredits: userCredits?.credits || 0 };
    })
})