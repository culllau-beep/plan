-- Supabase SQL Editor에서 실행하세요.
-- 로그인 없이 anon key로 읽고 쓰는 개인용 플래너 테이블입니다.

create table if not exists daily_plans (
  week_id text not null,
  day text not null,
  date text not null default '',
  hourly jsonb not null default '{}'::jsonb,
  goal text not null default '',
  todos jsonb not null default '[]'::jsonb,
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (week_id, day)
);

alter table daily_plans enable row level security;

create policy "anon can read daily_plans"
  on daily_plans for select
  using (true);

create policy "anon can upsert daily_plans"
  on daily_plans for insert
  with check (true);

create policy "anon can update daily_plans"
  on daily_plans for update
  using (true);

create policy "anon can delete daily_plans"
  on daily_plans for delete
  using (true);

-- 플래너 시작일(1주차 월요일)을 저장하는 설정 테이블. 이 값을 기준으로
-- 모든 주차/요일의 날짜가 자동으로 계산된다.
create table if not exists planner_settings (
  id int primary key default 1,
  start_date text not null default '',
  updated_at timestamptz not null default now()
);

alter table planner_settings enable row level security;

create policy "anon can read planner_settings"
  on planner_settings for select
  using (true);

create policy "anon can upsert planner_settings"
  on planner_settings for insert
  with check (true);

create policy "anon can update planner_settings"
  on planner_settings for update
  using (true);
