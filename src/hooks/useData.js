import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useData(familyId) {
  const [baby, setBaby] = useState(null);
  const [entries, setEntries] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all data for this family
  const loadAll = useCallback(async () => {
    if (!familyId) return;
    setLoading(true);

    const [babyRes, entRes, taskRes, msRes, qRes, aiRes, invRes, memRes] = await Promise.all([
      supabase.from('babies').select('*').eq('family_id', familyId).single(),
      supabase.from('entries').select('*').eq('family_id', familyId).order('recorded_at', { ascending: true }),
      supabase.from('tasks').select('*').eq('family_id', familyId).order('created_at', { ascending: true }),
      supabase.from('milestones').select('*').eq('family_id', familyId),
      supabase.from('questions').select('*').eq('family_id', familyId).order('created_at', { ascending: true }),
      supabase.from('ai_messages').select('*').eq('family_id', familyId).order('created_at', { ascending: true }),
      supabase.from('invitations').select('*').eq('family_id', familyId),
      supabase.from('profiles').select('*').eq('family_id', familyId),
    ]);

    if (babyRes.data) setBaby(babyRes.data);
    if (entRes.data) setEntries(entRes.data);
    if (taskRes.data) setTasks(taskRes.data);
    if (msRes.data) setMilestones(msRes.data);
    if (qRes.data) setQuestions(qRes.data);
    if (aiRes.data) setAiMessages(aiRes.data);
    if (invRes.data) setInvitations(invRes.data);
    if (memRes.data) setMembers(memRes.data);

    setLoading(false);
  }, [familyId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── BABY ──
  const saveBaby = async (babyData) => {
    if (baby?.id) {
      const { data } = await supabase.from('babies').update(babyData).eq('id', baby.id).select().single();
      if (data) setBaby(data);
      return data;
    } else {
      const { data } = await supabase.from('babies').insert({ ...babyData, family_id: familyId }).select().single();
      if (data) setBaby(data);
      return data;
    }
  };

  // ── ENTRIES ──
  const addEntry = async (entry) => {
    const { data } = await supabase.from('entries')
      .insert({ family_id: familyId, baby_id: baby?.id, type: entry.type, data: entry.data, recorded_by: entry.by, recorded_at: entry.ts || new Date().toISOString() })
      .select().single();
    if (data) setEntries(prev => [...prev, data]);
    return data;
  };

  const deleteEntry = async (id) => {
    await supabase.from('entries').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  // ── TASKS ──
  const addTask = async (task) => {
    const { data } = await supabase.from('tasks')
      .insert({ family_id: familyId, ...task })
      .select().single();
    if (data) setTasks(prev => [...prev, data]);
    return data;
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const { data } = await supabase.from('tasks')
      .update({ done: !task.done, done_at: !task.done ? new Date().toISOString() : null })
      .eq('id', id).select().single();
    if (data) setTasks(prev => prev.map(t => t.id === id ? data : t));
  };

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // ── MILESTONES ──
  const toggleMilestone = async (milestoneId) => {
    const existing = milestones.find(m => m.milestone_id === milestoneId);
    if (existing) {
      await supabase.from('milestones').delete().eq('id', existing.id);
      setMilestones(prev => prev.filter(m => m.id !== existing.id));
    } else {
      const { data } = await supabase.from('milestones')
        .insert({ family_id: familyId, milestone_id: milestoneId })
        .select().single();
      if (data) setMilestones(prev => [...prev, data]);
    }
  };

  // ── QUESTIONS ──
  const addQuestion = async (text, by) => {
    const { data } = await supabase.from('questions')
      .insert({ family_id: familyId, text, asked_by: by })
      .select().single();
    if (data) setQuestions(prev => [...prev, data]);
  };

  const toggleQuestion = async (id) => {
    const q = questions.find(q => q.id === id);
    if (!q) return;
    const newStatus = q.status === 'pending' ? 'done' : 'pending';
    const { data } = await supabase.from('questions')
      .update({ status: newStatus }).eq('id', id).select().single();
    if (data) setQuestions(prev => prev.map(x => x.id === id ? data : x));
  };

  const deleteQuestion = async (id) => {
    await supabase.from('questions').delete().eq('id', id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  // ── AI MESSAGES ──
  const addAiMessage = async (role, text) => {
    const { data } = await supabase.from('ai_messages')
      .insert({ family_id: familyId, role, text })
      .select().single();
    if (data) setAiMessages(prev => [...prev, data]);
  };

  const clearAiMessages = async () => {
    await supabase.from('ai_messages').delete().eq('family_id', familyId);
    setAiMessages([]);
  };

  // ── INVITATIONS ──
  const createInvitation = async (inv) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data } = await supabase.from('invitations')
      .insert({ family_id: familyId, code, ...inv })
      .select().single();
    if (data) setInvitations(prev => [...prev, data]);
    return data;
  };

  return {
    baby, entries, tasks, milestones, questions, aiMessages, invitations, members, loading,
    saveBaby, addEntry, deleteEntry,
    addTask, toggleTask, deleteTask,
    toggleMilestone,
    addQuestion, toggleQuestion, deleteQuestion,
    addAiMessage, clearAiMessages,
    createInvitation,
    reload: loadAll,
  };
}
