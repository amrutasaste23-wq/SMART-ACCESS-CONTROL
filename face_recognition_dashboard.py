import streamlit as st
import pandas as pd
import numpy as np
import time
from datetime import datetime
import plotly.express as px
from PIL import Image
import io

# --- SIMULATED FACE RECOGNITION LOGIC ---
def detect_face(image):
    # Simulate processing delay
    time.sleep(0.5)
    
    # Randomly simulate detections for demo purposes
    # In reality, this would use your trained model
    is_unknown = np.random.random() > 0.6
    confidence = np.random.uniform(0.85, 0.99)
    
    if is_unknown:
        return "Unknown", confidence
    else:
        return "Owner", confidence

# --- DASHBOARD CONFIG ---
st.set_page_config(page_title="FaceGuard AI Dashboard", layout="wide")

st.markdown("""
<style>
    .main { background-color: #f8f9fa; }
    .stButton>button { width: 100%; border-radius: 5px; height: 3em; font-weight: bold; }
    .threat-alert { padding: 20px; background-color: #ff4b4b; color: white; border-radius: 10px; text-align: center; font-weight: bold; font-size: 24px; animation: blinker 1s linear infinite; }
    .safe-alert { padding: 20px; background-color: #28a745; color: white; border-radius: 10px; text-align: center; font-weight: bold; font-size: 24px; }
    @keyframes blinker { 50% { opacity: 0; } }
</style>
""", unsafe_allow_html=True)

# --- SESSION STATE ---
if 'logs' not in st.session_state:
    st.session_state.logs = []
if 'owners' not in st.session_state:
    st.session_state.owners = []
if 'monitoring' not in st.session_state:
    st.session_state.monitoring = False

# --- SIDEBAR NAVIGATION ---
st.sidebar.title("🛡️ FaceGuard AI")
mode = st.sidebar.radio("Select Mode", ["🏠 Setup Mode", "📹 Monitoring Mode", "📊 Analytics"])

# --- MODES ---

if mode == "🏠 Setup Mode":
    st.title("Step 1: Setup Owner Database")
    st.write("Upload images of authorized owners to train the system.")
    
    uploaded_files = st.file_uploader("Upload Owner Images", type=['png', 'jpg', 'jpeg'], accept_multiple_files=True)
    
    if uploaded_files:
        cols = st.columns(4)
        for idx, file in enumerate(uploaded_files):
            with cols[idx % 4]:
                st.image(file, use_container_width=True)
        
        if st.button("✅ Save Owners & Generate Encodings"):
            with st.spinner("Processing encodings..."):
                time.sleep(2)
                st.session_state.owners = [f.name for f in uploaded_files]
                st.success(f"Successfully stored {len(uploaded_files)} owner encodings!")

elif mode == "📹 Monitoring Mode":
    st.title("Step 2: Real-time Monitoring")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        if not st.session_state.monitoring:
            if st.button("🚀 Start System Monitoring", type="primary"):
                if not st.session_state.owners:
                    st.warning("Please setup owners first!")
                else:
                    st.session_state.monitoring = True
                    st.rerun()
        else:
            if st.button("🛑 Stop System Monitoring"):
                st.session_state.monitoring = False
                st.rerun()
                
            st.write("### Live Feed (Simulation)")
            # In Colab, we use file upload to simulate camera frames
            test_img = st.file_uploader("Upload Frame to Test", type=['png', 'jpg', 'jpeg'])
            
            if test_img:
                img = Image.open(test_img)
                st.image(img, use_container_width=True)
                
                name, conf = detect_face(img)
                status = "Owner" if name == "Owner" else "Threat"
                
                # Alert Logic
                if status == "Threat":
                    st.markdown('<div class="threat-alert">⚠️ UNKNOWN PERSON - THREAT DETECTED</div>', unsafe_allow_html=True)
                else:
                    st.markdown('<div class="safe-alert">✔️ OWNER DETECTED - SAFE ACCESS</div>', unsafe_allow_html=True)
                
                st.metric("Confidence Score", f"{conf:.2%}")
                
                # Log writing
                new_log = {
                    "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "Subject": name,
                    "Status": status,
                    "Confidence": f"{conf:.2%}"
                }
                st.session_state.logs.append(new_log)

    with col2:
        st.write("### Recent Activity Logs")
        if st.session_state.logs:
            df = pd.DataFrame(st.session_state.logs)
            st.table(df.tail(5))
            
            # Download CSV
            csv = df.to_csv(index=False).encode('utf-8')
            st.download_button("📥 Download Logs (CSV)", data=csv, file_name="faceguard_logs.csv", mime="text/csv")
        else:
            st.info("No logs generated yet.")

elif mode == "📊 Analytics":
    st.title("System Analytics")
    
    if st.session_state.logs:
        df = pd.DataFrame(st.session_state.logs)
        
        # Stats
        m1, m2, m3 = st.columns(3)
        m1.metric("Total Detections", len(df))
        m2.metric("Owners Verified", len(df[df['Status'] == 'Owner']))
        m3.metric("Threats Detected", len(df[df['Status'] == 'Threat']))
        
        # Charts
        c1, c2 = st.columns(2)
        
        with c1:
            st.write("#### Detection Distribution")
            fig_pie = px.pie(df, names='Status', color='Status', 
                           color_discrete_map={'Owner':'green', 'Threat':'red'})
            st.plotly_chart(fig_pie, use_container_width=True)
            
        with c2:
            st.write("#### Timeline Trends")
            df['Time'] = pd.to_datetime(df['Timestamp'])
            fig_bar = px.bar(df, x='Timestamp', color='Status', 
                           color_discrete_map={'Owner':'green', 'Threat':'red'})
            st.plotly_chart(fig_bar, use_container_width=True)
            
    else:
        st.info("Start monitoring to see analytics.")

# --- FOOTER ---
st.sidebar.markdown("---")
st.sidebar.write("Developed by AI Studio Expert")
